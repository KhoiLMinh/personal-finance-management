package com.personal.finance.backend.backup.dto;

import com.personal.finance.backend.budgets.dto.response.BudgetDTO;
import com.personal.finance.backend.categories.dto.response.CategoryDTO;
import com.personal.finance.backend.savingGoals.dto.response.SavingGoalDTO;
import com.personal.finance.backend.transactions.dto.response.TransactionDTO;
import com.personal.finance.backend.wallets.dto.response.WalletDTO;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BackupDataDTO {
    private String exportDate;
    private String version = "1.0";
    private List<WalletDTO> wallets;
    private List<CategoryDTO> categories;
    private List<TransactionDTO> transactions;
    private List<BudgetDTO> budgets;
    private List<SavingGoalDTO> savingGoals;
}