package com.h5.domain.auth.service;

import com.h5.domain.auth.model.ConsultantCustomUserDetails;
import com.h5.domain.consultant.repository.ConsultantUserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class ConsultantCustomUserDetailService implements UserDetailsService {
    private final ConsultantUserRepository consultantUserRepository;

    public ConsultantCustomUserDetailService(ConsultantUserRepository consultantUserRepository) {
        this.consultantUserRepository = consultantUserRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return consultantUserRepository.findByEmailAndDeleteDttmIsNull(email)
                .map(ConsultantCustomUserDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
