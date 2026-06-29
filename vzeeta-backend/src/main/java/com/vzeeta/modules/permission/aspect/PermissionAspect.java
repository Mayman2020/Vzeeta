package com.vzeeta.modules.permission.aspect;

import com.vzeeta.modules.permission.annotation.RequiresPermission;
import com.vzeeta.modules.permission.service.PermissionEvaluatorService;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
public class PermissionAspect {

    private final PermissionEvaluatorService permissionEvaluatorService;

    @Around("@annotation(requiredPermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint, RequiresPermission requiredPermission) throws Throwable {
        permissionEvaluatorService.assertCan(requiredPermission.module(), requiredPermission.action());
        return joinPoint.proceed();
    }
}
