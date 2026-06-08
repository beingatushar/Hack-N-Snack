package com.accenture.smartquiz.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Pointcut("within(com.accenture.smartquiz.controller..*) || within(com.accenture.smartquiz.service..*)")
    public void applicationLayer() {}

    @Around("applicationLayer()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getSignature().getDeclaringType().getSimpleName();
        String methodName = joinPoint.getSignature().getName();

        log.debug(">>> {}.{}()", className, methodName);
        long start = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();
            long elapsed = System.currentTimeMillis() - start;
            log.debug("<<< {}.{}() completed in {}ms", className, methodName, elapsed);
            return result;
        } catch (Exception ex) {
            long elapsed = System.currentTimeMillis() - start;
            log.error("!!! {}.{}() threw {} after {}ms: {}",
                    className, methodName, ex.getClass().getSimpleName(), elapsed, ex.getMessage());
            throw ex;
        }
    }
}
