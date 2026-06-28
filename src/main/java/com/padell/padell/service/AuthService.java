package com.padell.padell.service;

import com.padelPlay.dto.request.LoginRequest;
import com.padelPlay.dto.response.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}
