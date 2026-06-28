package com.padell.padell.service;

import com.padell.padell.dto.request.LoginRequest;
import com.padell.padell.dto.response.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}
