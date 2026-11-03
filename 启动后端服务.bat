@echo off
chcp 65001 > nul
title Monarca 后端服务 (v4.7.0)

echo ========================================================
echo   Monarca 伊拉克电商管理系统后端服务启动中...
echo   版本: v4.7.0
echo ========================================================
echo.

set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.12"
set "PATH=%JAVA_HOME%\bin;%PATH%"

cd /d "%~dp0monarca-server"

echo [1/2] 正在启动 Spring Boot 3 服务...
echo 数据库模式: H2 持久化 (文件位于 monarca-server/data/monarcadb)
echo 访问端口: 8080
echo.
echo ========================================================
echo   服务就绪后可访问：
echo   - 管理后台:   http://localhost:8080/admin/index.html
echo   - 接口文档:   http://localhost:8080/swagger-ui.html
echo   - H2 控制台:  http://localhost:8080/h2-console
echo ========================================================
echo.

java -jar target/monarca-server-4.7.0.jar

pause
