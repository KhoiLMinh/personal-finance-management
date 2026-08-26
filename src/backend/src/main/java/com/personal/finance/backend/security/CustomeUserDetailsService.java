package com.personal.finance.backend.security;

import org.springframework.security.core.userdetails.User;
import com.personal.finance.backend.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
@RequiredArgsConstructor
public class CustomeUserDetailsService implements UserDetailsService {

    private final UserService userService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        com.personal.finance.backend.users.entity.User myUser = this.userService.findUserByUserName(username);
        if(myUser == null)
            throw new UsernameNotFoundException("Không tìm thấy user");

        if (!myUser.isActive()) {
            throw new RuntimeException("Tài khoản của bạn đã bị quản trị viên khóa!");
        }

        return new User(myUser.getEmail(), myUser.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + myUser.getRole())));
    }
}
