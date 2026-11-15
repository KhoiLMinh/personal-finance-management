package com.personal.finance.backend.transactions.repository;

import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.configs.JpaConfig;
import com.personal.finance.backend.transactions.entity.Transaction;
import com.personal.finance.backend.users.entity.User;
import com.personal.finance.backend.wallets.entity.Wallet;
import com.personal.finance.backend.wallets.entity.WalletMember;
import com.personal.finance.backend.wallets.repository.WalletRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Regression: a wallet shared with N members must not have its transactions/balance counted N times
 * (LEFT JOIN on wallet members used to multiply rows in every aggregate query).
 */
@DataJpaTest
@Import(JpaConfig.class)
class SharedWalletAggregationTest {

    @Autowired EntityManager em;
    @Autowired TransactionRepository transactionRepository;
    @Autowired WalletRepository walletRepository;

    private User owner, memberA, outsider;
    private Wallet wallet;
    private Category food;
    private Transaction expense;
    private final LocalDate day = LocalDate.of(2026, 11, 10);

    private User user(String name) {
        User u = new User();
        u.setUsername(name);
        u.setEmail(name + "@test.local");
        u.setPassword("x");
        em.persist(u);
        return u;
    }

    private void member(User u, WalletMember.Permission p) {
        WalletMember m = new WalletMember();
        m.setWallet(wallet);
        m.setUser(u);
        m.setPermissions(p);
        em.persist(m);
    }

    private Transaction tx(BigDecimal amount, Transaction.TransactionType type) {
        Transaction t = new Transaction();
        t.setWallet(wallet);
        t.setCategory(food);
        t.setAmount(amount);
        t.setType(type);
        t.setDate(day);
        t.setDescription("test");
        em.persist(t);
        return t;
    }

    @BeforeEach
    void setUp() {
        owner = user("owner");
        memberA = user("membera");
        User memberB = user("memberb");
        outsider = user("outsider");

        wallet = new Wallet();
        wallet.setName("Shared");
        wallet.setBalance(new BigDecimal("1000000.00"));
        wallet.setOwner(owner);
        em.persist(wallet);

        member(memberA, WalletMember.Permission.EDIT);
        member(memberB, WalletMember.Permission.VIEW);

        food = new Category();
        food.setName("Food");
        food.setType(Category.CategoryType.EXPENSE);
        food.setUser(owner);
        em.persist(food);

        expense = tx(new BigDecimal("100000.00"), Transaction.TransactionType.EXPENSE);
        tx(new BigDecimal("500000.00"), Transaction.TransactionType.INCOME);
        em.flush();
        em.clear();
    }

    @Test
    void totals_areNotMultipliedByMemberCount() {
        assertEquals(0, new BigDecimal("100000").compareTo(
                transactionRepository.getTotalAmountByType(owner.getId(), Transaction.TransactionType.EXPENSE, day, day)));
        assertEquals(0, new BigDecimal("500000").compareTo(
                transactionRepository.getTotalAmountByType(owner.getId(), Transaction.TransactionType.INCOME, null, null)));
        assertEquals(0, new BigDecimal("100000").compareTo(
                transactionRepository.sumExpenseByCategoryAndMonth(food.getId(), owner.getId(), 11, 2026, Transaction.TransactionType.EXPENSE)));
        assertEquals(0, new BigDecimal("100000").compareTo(
                transactionRepository.getExpenseByCategory(owner.getId(), day, day).get(0).getTotalAmount()));
    }

    @Test
    void totalBalance_isNotMultipliedByMemberCount() {
        assertEquals(0, new BigDecimal("1000000").compareTo(walletRepository.getTotalBalanceAccessibleByUser(owner.getId())));
        assertEquals(0, new BigDecimal("1000000").compareTo(walletRepository.getTotalBalanceAccessibleByUser(memberA.getId())));
    }

    @Test
    void listAndLookup_returnEachTransactionOnce() {
        assertEquals(2, transactionRepository.filterTransactions(owner.getId(), null, null, null, null, null, Pageable.unpaged()).getContent().size());
        assertEquals(2, transactionRepository.filterTransactions(owner.getId(), null, null, null, null, null, Pageable.ofSize(10)).getTotalElements());
        // used to throw IncorrectResultSizeDataAccessException when the wallet had >= 2 members
        assertTrue(transactionRepository.findByIdAndAccessibleByUser(expense.getId(), owner.getId()).isPresent());
        assertTrue(transactionRepository.findByIdAndAccessibleByUser(expense.getId(), memberA.getId()).isPresent());
    }

    @Test
    void outsider_seesNothing() {
        assertTrue(transactionRepository.findByIdAndAccessibleByUser(expense.getId(), outsider.getId()).isEmpty());
        assertEquals(0, BigDecimal.ZERO.compareTo(walletRepository.getTotalBalanceAccessibleByUser(outsider.getId())));
        assertEquals(0, BigDecimal.ZERO.compareTo(
                transactionRepository.getTotalAmountByType(outsider.getId(), Transaction.TransactionType.EXPENSE, null, null)));
        assertFalse(walletRepository.hasEditPermission(wallet.getId(), outsider.getId()));
    }

    @Test
    void duplicateCheck_matchesBigDecimalAmount() {
        assertTrue(transactionRepository.existsByWalletIdAndDateAndAmountAndDescription(
                wallet.getId(), day, new BigDecimal("100000"), "test"));
    }
}
