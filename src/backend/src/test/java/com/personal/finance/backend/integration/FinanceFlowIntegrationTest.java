package com.personal.finance.backend.integration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * End-to-end through real HTTP: Spring Security + JWT filter + controllers + services + JPA (H2 test DB).
 * No mocks. Guards the Transaction -> Wallet balance -> Budget -> Report chain, shared-wallet permissions,
 * data isolation and import duplicate detection.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class FinanceFlowIntegrationTest {

    private static final ParameterizedTypeReference<Map<String, Object>> MAP = new ParameterizedTypeReference<>() {};
    private static final ParameterizedTypeReference<List<Map<String, Object>>> LIST = new ParameterizedTypeReference<>() {};

    @Autowired TestRestTemplate http;

    private final String today = LocalDate.now().toString();
    private String run;

    @BeforeEach
    void setUp() {
        run = UUID.randomUUID().toString().substring(0, 6);
    }

    // ---------- helpers ----------
    private record User(String username, String token) {}

    private User newUser(String key) {
        String username = "it_" + key + "_" + run;
        http.postForEntity("/api/v1/auth/register",
                Map.of("username", username, "email", username + "@it.local", "password", "Passw0rd!"), String.class);
        ResponseEntity<Map<String, Object>> login = http.exchange("/api/v1/auth/login", HttpMethod.POST,
                new HttpEntity<>(Map.of("username", username, "password", "Passw0rd!")), MAP);
        assertEquals(HttpStatus.OK, login.getStatusCode());
        return new User(username, (String) login.getBody().get("token"));
    }

    private HttpHeaders auth(User u) {
        HttpHeaders h = new HttpHeaders();
        h.setBearerAuth(u.token());
        return h;
    }

    private ResponseEntity<Map<String, Object>> send(HttpMethod method, String url, User u, Object body) {
        return http.exchange(url, method, new HttpEntity<>(body, auth(u)), MAP);
    }

    private List<Map<String, Object>> getList(String url, User u) {
        return http.exchange(url, HttpMethod.GET, new HttpEntity<>(auth(u)), LIST).getBody();
    }

    private BigDecimal num(Object o) {
        return new BigDecimal(String.valueOf(o));
    }

    private BigDecimal balance(User u, long walletId) {
        return getList("/api/v1/wallets", u).stream()
                .filter(w -> ((Number) w.get("id")).longValue() == walletId)
                .map(w -> num(w.get("balance"))).findFirst().orElseThrow();
    }

    private long categoryId(User u, String type) {
        return getList("/api/v1/categories", u).stream()
                .filter(c -> type.equals(c.get("type")))
                .map(c -> ((Number) c.get("id")).longValue()).findFirst().orElseThrow();
    }

    private long createWallet(User u, int balance) {
        var res = send(HttpMethod.POST, "/api/v1/wallets", u, Map.of("name", "IT wallet " + run, "balance", balance));
        assertEquals(HttpStatus.CREATED, res.getStatusCode());
        return ((Number) res.getBody().get("id")).longValue();
    }

    private ResponseEntity<Map<String, Object>> tx(User u, long walletId, long categoryId, int amount, String type) {
        return send(HttpMethod.POST, "/api/v1/transactions", u, Map.of(
                "walletId", walletId, "categoryId", categoryId, "amount", amount, "type", type, "date", today, "description", "IT " + type + " " + run));
    }

    // ---------- tests ----------

    @Test
    void transactionChangesFlowConsistentlyIntoBalanceBudgetAndReport() {
        User a = newUser("a");
        long wallet = createWallet(a, 1_000_000);
        long expenseCat = categoryId(a, "EXPENSE");
        long incomeCat = categoryId(a, "INCOME");

        var budget = send(HttpMethod.POST, "/api/v1/budgets", a, Map.of(
                "categoryId", expenseCat, "month", LocalDate.now().getMonthValue(), "year", LocalDate.now().getYear(), "limitAmount", 500_000));
        assertEquals(HttpStatus.CREATED, budget.getStatusCode());

        long expenseId = ((Number) tx(a, wallet, expenseCat, 500_000, "EXPENSE").getBody().get("id")).longValue();
        tx(a, wallet, incomeCat, 200_000, "INCOME");
        assertEquals(0, new BigDecimal("700000").compareTo(balance(a, wallet)));

        Map<String, Object> budgetRow = (Map<String, Object>) ((List<?>) send(HttpMethod.GET, "/api/v1/budgets", a, null).getBody().get("content")).get(0);
        assertEquals("EXCEED", budgetRow.get("status"), "spending == limit must flag EXCEED");

        var overview = send(HttpMethod.GET, "/api/v1/report/overview?startDate=" + today + "&endDate=" + today, a, null).getBody();
        assertEquals(0, new BigDecimal("500000").compareTo(num(overview.get("totalExpense"))));
        assertEquals(0, new BigDecimal("200000").compareTo(num(overview.get("totalIncome"))));
        assertEquals(0, new BigDecimal("700000").compareTo(num(overview.get("totalBalance"))));

        assertEquals(HttpStatus.NO_CONTENT, send(HttpMethod.DELETE, "/api/v1/transactions/" + expenseId, a, null).getStatusCode());
        assertEquals(0, new BigDecimal("1200000").compareTo(balance(a, wallet)));
        budgetRow = (Map<String, Object>) ((List<?>) send(HttpMethod.GET, "/api/v1/budgets", a, null).getBody().get("content")).get(0);
        assertEquals("ACTIVE", budgetRow.get("status"), "deleting the expense must clear EXCEED");
    }

    @Test
    void overspendIsRejectedAndRolledBack() {
        User a = newUser("a");
        long wallet = createWallet(a, 100_000);
        var res = tx(a, wallet, categoryId(a, "EXPENSE"), 100_001, "EXPENSE");
        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
        assertEquals(0, new BigDecimal("100000").compareTo(balance(a, wallet)));
        assertEquals(0, ((Number) send(HttpMethod.GET, "/api/v1/transactions?walletId=" + wallet, a, null).getBody().get("totalElements")).intValue());
    }

    @Test
    void usersCannotSeeOrTouchEachOthersData() {
        User a = newUser("a");
        User b = newUser("b");
        long wallet = createWallet(a, 100_000);
        long txId = ((Number) tx(a, wallet, categoryId(a, "EXPENSE"), 1_000, "EXPENSE").getBody().get("id")).longValue();

        assertTrue(getList("/api/v1/wallets", b).isEmpty());
        assertEquals(0, ((Number) send(HttpMethod.GET, "/api/v1/transactions", b, null).getBody().get("totalElements")).intValue());
        assertTrue(send(HttpMethod.DELETE, "/api/v1/transactions/" + txId, b, null).getStatusCode().is4xxClientError());
        assertEquals(HttpStatus.FORBIDDEN, send(HttpMethod.DELETE, "/api/v1/wallets/" + wallet, b, null).getStatusCode());
        assertEquals(0, BigDecimal.ZERO.compareTo(num(send(HttpMethod.GET, "/api/v1/report/overview", b, null).getBody().get("totalBalance"))));
    }

    @Test
    void sharedWalletViewIsReadOnlyEditCanWriteAndTotalsAreNotMultiplied() {
        User a = newUser("a");
        User b = newUser("b");
        User c = newUser("c");
        long wallet = createWallet(a, 1_000_000);
        tx(a, wallet, categoryId(a, "EXPENSE"), 100_000, "EXPENSE");

        String invite = (String) send(HttpMethod.POST, "/api/v1/families", a, Map.of("name", "IT fam " + run)).getBody().get("inviteCode");
        send(HttpMethod.POST, "/api/v1/families/join", b, Map.of("inviteCode", invite));
        send(HttpMethod.POST, "/api/v1/families/join", c, Map.of("inviteCode", invite));
        send(HttpMethod.POST, "/api/v1/wallets/" + wallet + "/members/share", a, Map.of("email", b.username() + "@it.local", "permission", "VIEW"));
        send(HttpMethod.POST, "/api/v1/wallets/" + wallet + "/members/share", a, Map.of("email", c.username() + "@it.local", "permission", "EDIT"));

        assertEquals("VIEW", getList("/api/v1/wallets", b).get(0).get("myPermission"));
        assertEquals("EDIT", getList("/api/v1/wallets", c).get(0).get("myPermission"));
        assertEquals("OWNER", getList("/api/v1/wallets", a).get(0).get("myPermission"));
        assertEquals(HttpStatus.FORBIDDEN, tx(b, wallet, categoryId(b, "EXPENSE"), 1_000, "EXPENSE").getStatusCode());
        assertEquals(HttpStatus.CREATED, tx(c, wallet, categoryId(c, "EXPENSE"), 50_000, "EXPENSE").getStatusCode());
        assertEquals(0, new BigDecimal("850000").compareTo(balance(a, wallet)));

        // wallet has 2 members: owner's aggregates must count each row once
        var overview = send(HttpMethod.GET, "/api/v1/report/overview?startDate=" + today + "&endDate=" + today, a, null).getBody();
        assertEquals(0, new BigDecimal("150000").compareTo(num(overview.get("totalExpense"))));
        assertEquals(0, new BigDecimal("850000").compareTo(num(overview.get("totalBalance"))));
    }

    @Test
    void reimportingTheSameStatementCreatesNoDuplicates() {
        User a = newUser("a");
        long wallet = createWallet(a, 1_000_000);
        // descriptions hit the seeded keyword rules (Highlands, Grab) so no Gemini call is made from the test
        String csv = "Ngày,Số tiền,Nội dung\n" + today + ",-45000,Highlands IT " + run + "\n" + today + ",-80000,Grab IT " + run + "\n";

        Map<String, Object> first = upload(a, wallet, csv);
        assertEquals(2, ((Number) first.get("successRows")).intValue());
        assertEquals(0, new BigDecimal("875000").compareTo(balance(a, wallet)));

        Map<String, Object> second = upload(a, wallet, csv);
        assertEquals(0, ((Number) second.get("successRows")).intValue());
        assertEquals(2, ((Number) second.get("duplicatedRows")).intValue());
        assertEquals(0, new BigDecimal("875000").compareTo(balance(a, wallet)));
    }

    private Map<String, Object> upload(User u, long wallet, String csv) {
        var form = new LinkedMultiValueMap<String, Object>();
        form.add("walletId", String.valueOf(wallet));
        form.add("dateCol", "0");
        form.add("amountCol", "1");
        form.add("descCol", "2");
        form.add("file", new ByteArrayResource(csv.getBytes(java.nio.charset.StandardCharsets.UTF_8)) {
            @Override public String getFilename() { return "statement.csv"; }
        });
        HttpHeaders h = auth(u);
        h.setContentType(MediaType.MULTIPART_FORM_DATA);
        ResponseEntity<Map<String, Object>> res = http.exchange("/api/v1/import-batches/upload", HttpMethod.POST, new HttpEntity<>(form, h), MAP);
        assertEquals(HttpStatus.CREATED, res.getStatusCode(), String.valueOf(res.getBody()));
        return res.getBody();
    }

    @Test
    void protectedEndpointWithoutTokenIsRejected() {
        assertEquals(HttpStatus.UNAUTHORIZED, http.getForEntity("/api/v1/wallets", String.class).getStatusCode());

        HttpHeaders bad = new HttpHeaders();
        bad.setBearerAuth("not.a.jwt");
        assertEquals(HttpStatus.UNAUTHORIZED,
                http.exchange("/api/v1/wallets", HttpMethod.GET, new HttpEntity<>(bad), String.class).getStatusCode());

        // signed in but not allowed stays 403, so the client can tell "no permission" from "session expired"
        User user = newUser("u");
        assertEquals(HttpStatus.FORBIDDEN,
                http.exchange("/api/v1/users", HttpMethod.GET, new HttpEntity<>(auth(user)), String.class).getStatusCode());
    }
}
