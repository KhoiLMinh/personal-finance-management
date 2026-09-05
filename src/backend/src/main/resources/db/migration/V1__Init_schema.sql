-- V1__Init_schema.sql
CREATE TABLE IF NOT EXISTS system_setting (
                                              setting_key VARCHAR(50) PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL,
    description VARCHAR(255)
    );

CREATE TABLE IF NOT EXISTS users (
                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     create_at DATETIME NOT NULL,
                                     update_at DATETIME NOT NULL,
                                     username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    avatar VARCHAR(255),
    active BIT NOT NULL,
    provider VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL
    );

CREATE TABLE IF NOT EXISTS family (
                                      id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                      create_at DATETIME NOT NULL,
                                      update_at DATETIME NOT NULL,
                                      name VARCHAR(100) NOT NULL,
    invite_code VARCHAR(255) UNIQUE,
    owner_id BIGINT NOT NULL UNIQUE,
    FOREIGN KEY (owner_id) REFERENCES users(id)
    );

CREATE TABLE IF NOT EXISTS family_member (
                                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                             create_at DATETIME NOT NULL,
                                             update_at DATETIME NOT NULL,
                                             role VARCHAR(20) NOT NULL,
    family_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL UNIQUE,
    FOREIGN KEY (family_id) REFERENCES family(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
    );

CREATE TABLE IF NOT EXISTS category (
                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                        create_at DATETIME NOT NULL,
                                        update_at DATETIME NOT NULL,
                                        name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    icon VARCHAR(255),
    color VARCHAR(255),
    is_hidden BIT NOT NULL,
    parent_id BIGINT,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES category(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
    );

CREATE TABLE IF NOT EXISTS category_rule (
                                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                             create_at DATETIME NOT NULL,
                                             update_at DATETIME NOT NULL,
                                             keyword VARCHAR(100) NOT NULL,
    priority INT NOT NULL,
    category_id BIGINT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES category(id)
    );

CREATE TABLE IF NOT EXISTS wallet (
                                      id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                      create_at DATETIME NOT NULL,
                                      update_at DATETIME NOT NULL,
                                      name VARCHAR(100) NOT NULL,
    balance DECIMAL(19,2) NOT NULL,
    icon VARCHAR(255),
    color VARCHAR(255),
    owner_id BIGINT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id)
    );

CREATE TABLE IF NOT EXISTS wallet_member (
                                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                             create_at DATETIME NOT NULL,
                                             update_at DATETIME NOT NULL,
                                             permissions VARCHAR(20) NOT NULL,
    user_id BIGINT NOT NULL,
    wallet_id BIGINT NOT NULL,
    UNIQUE KEY uk_wallet_user (wallet_id, user_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (wallet_id) REFERENCES wallet(id)
    );

CREATE TABLE IF NOT EXISTS import_batch (
                                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                            create_at DATETIME NOT NULL,
                                            update_at DATETIME NOT NULL,
                                            file_name VARCHAR(255),
    total_rows INT,
    success_rows INT,
    duplicated_rows INT,
    status BIT NOT NULL,
    wallet_id BIGINT NOT NULL,
    FOREIGN KEY (wallet_id) REFERENCES wallet(id)
    );

CREATE TABLE IF NOT EXISTS transaction (
                                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                           create_at DATETIME NOT NULL,
                                           update_at DATETIME NOT NULL,
                                           amount DECIMAL(19,2) NOT NULL,
    type VARCHAR(20) NOT NULL,
    description VARCHAR(255),
    date DATE NOT NULL,
    status VARCHAR(255),
    category_id BIGINT NOT NULL,
    import_batch_id BIGINT,
    wallet_id BIGINT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES category(id),
    FOREIGN KEY (import_batch_id) REFERENCES import_batch(id),
    FOREIGN KEY (wallet_id) REFERENCES wallet(id)
    );

CREATE TABLE IF NOT EXISTS transaction_history (
                                                   id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                   create_at DATETIME NOT NULL,
                                                   update_at DATETIME NOT NULL,
                                                   new_amount DECIMAL(19,2),
    new_date DATE,
    new_description VARCHAR(255),
    new_type VARCHAR(20),
    old_amount DECIMAL(19,2),
    old_date DATE,
    old_description VARCHAR(255),
    old_type VARCHAR(20),
    modified_by BIGINT NOT NULL,
    transaction_id BIGINT NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transaction(id)
    );

CREATE TABLE IF NOT EXISTS budget (
                                      id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                      create_at DATETIME NOT NULL,
                                      update_at DATETIME NOT NULL,
                                      limit_amount DECIMAL(19,2) NOT NULL,
    budget_month INT NOT NULL,
    budget_year INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    warning_percent DOUBLE,
    is_warning_sent BIT NOT NULL,
    category_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    UNIQUE KEY uk_budget_user_cat_time (user_id, category_id, budget_month, budget_year),
    FOREIGN KEY (category_id) REFERENCES category(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
    );

CREATE TABLE IF NOT EXISTS budget_history (
                                              id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                              create_at DATETIME(6) NOT NULL,
    update_at DATETIME(6) NOT NULL,
    new_limit_amount DECIMAL(19,2),
    old_limit_amount DECIMAL(19,2),
    new_warning_percent DOUBLE,
    old_warning_percent DOUBLE,
    modified_by BIGINT NOT NULL,
    budget_id BIGINT NOT NULL,
    FOREIGN KEY (budget_id) REFERENCES budget(id)
    );

CREATE TABLE IF NOT EXISTS saving_goal (
                                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                           create_at DATETIME NOT NULL,
                                           update_at DATETIME NOT NULL,
                                           current_amount DECIMAL(19,2) NOT NULL,
    target_amount DECIMAL(19,2) NOT NULL,
    deadline DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    title VARCHAR(100) NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
    );

CREATE TABLE IF NOT EXISTS notification (
                                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                            create_at DATETIME NOT NULL,
                                            update_at DATETIME NOT NULL,
                                            content TEXT,
                                            is_read BIT NOT NULL,
                                            priority INT NOT NULL DEFAULT 2,
                                            title VARCHAR(150) NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
    );

CREATE TABLE IF NOT EXISTS recurring_bill (
                                              id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                              create_at DATETIME NOT NULL,
                                              update_at DATETIME NOT NULL,
                                              amount DECIMAL(19,2) NOT NULL,
    description VARCHAR(255),
    frequency VARCHAR(20) NOT NULL,
    execution_day INT,
    notification_time TIME,
    last_executed DATE,
    last_warning DATE,
    title VARCHAR(100) NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
    );