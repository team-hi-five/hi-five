package com.h5.global.redis;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
public class RedisService {

    private final RedisTemplate<Object, Object> redisTemplate;
    private static final long REFRESH_TOKEN_EXPIRE_MILLIS = Duration.ofDays(15).toMillis();

    public RedisService(RedisTemplate<Object, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void saveRefreshToken(String email, String refreshToken) {
        redisTemplate.opsForValue()
                .set(email, refreshToken, REFRESH_TOKEN_EXPIRE_MILLIS, TimeUnit.MILLISECONDS);
    }

    public String getRefreshToken(String email) {
        Object value = redisTemplate.opsForValue().get(email);
        return value != null ? value.toString() : null;
    }

    public void deleteRefreshToken(String email) {
        redisTemplate.delete(email);
    }

    public void saveBlacklistedToken(String token, long expirationMillis) {
        redisTemplate.opsForValue()
                .set(token, "blacklisted", expirationMillis, TimeUnit.MILLISECONDS);
    }
}