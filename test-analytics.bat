@echo off
setlocal

set TOKEN_ADMIN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi0wMDEiLCJpZCI6ImFkbWluLTAwMSIsImVtYWlsIjoiYWRtaW5AcGV0d2VsbC5jbyIsInJvbGUiOiJQRVRXRUxMX0FETUlOIiwiaWF0IjoxNzc2MzI1NzE1LCJleHAiOjE3NzYzMzI5MTV9.lnImNZffJg-k4sKtbf6dUCEE4JvFgD-bKcPZjQF2GAA
set TOKEN_CLINIC_A=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbGluaWMtdXNlci0wMDEiLCJpZCI6ImNsaW5pYy11c2VyLTAwMSIsImVtYWlsIjoiYWRtaW5AY2xpbmljQS5jbyIsInJvbGUiOiJDTElOSUNfQURNSU4iLCJjbGluaWNfaWQiOiJDTElOSUNfQSIsImlhdCI6MTc3NjMyNTcxNSwiZXhwIjoxNzc2MzMyOTE1fQ.239DXJ4ArHDRcROYGZhJInh5cD19cZ9tny3tKch2TUc
set TOKEN_VET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ2ZXQtMDAxIiwiaWQiOiJ2ZXQtMDAxIiwiZW1haWwiOiJ2ZXRAY2xpbmljQS5jbyIsInJvbGUiOiJWRVRFUklOQVJJTyIsImNsaW5pY19pZCI6IkNMSU5JQ19BIiwiaWF0IjoxNzc2MzI1NzE1LCJleHAiOjE3NzYzMzI5MTV9.tlVDqSRWjBBivdpMdRm_DxjlhqrAZbVV6q0H_fYJ350
set BASE=http://localhost:3008/api/v1/analytics

echo.
echo === TEST 1: Sin token ^(debe ser 401^) ===
curl -s -w "\nHTTP: %%{http_code}\n" %BASE%/global

echo.
echo === TEST 2: PETWELL_ADMIN accede a /global ^(debe ser 200^) ===
curl -s -w "\nHTTP: %%{http_code}\n" -H "Authorization: Bearer %TOKEN_ADMIN%" %BASE%/global

echo.
echo === TEST 3: CLINIC_ADMIN accede a /global ^(debe ser 403^) ===
curl -s -w "\nHTTP: %%{http_code}\n" -H "Authorization: Bearer %TOKEN_CLINIC_A%" %BASE%/global

echo.
echo === TEST 4: CLINIC_ADMIN accede a SU clinica /clinic/CLINIC_A ^(debe ser 200^) ===
curl -s -w "\nHTTP: %%{http_code}\n" -H "Authorization: Bearer %TOKEN_CLINIC_A%" %BASE%/clinic/CLINIC_A

echo.
echo === TEST 5: CLINIC_ADMIN accede a OTRA clinica /clinic/CLINIC_B ^(debe ser 403^) ===
curl -s -w "\nHTTP: %%{http_code}\n" -H "Authorization: Bearer %TOKEN_CLINIC_A%" %BASE%/clinic/CLINIC_B

echo.
echo === TEST 6: PETWELL_ADMIN accede a /clinic/CLINIC_A ^(debe ser 200^) ===
curl -s -w "\nHTTP: %%{http_code}\n" -H "Authorization: Bearer %TOKEN_ADMIN%" %BASE%/clinic/CLINIC_A

echo.
echo === TEST 7: PETWELL_ADMIN accede a /clinic/CLINIC_A/revenue ^(debe ser 200^) ===
curl -s -w "\nHTTP: %%{http_code}\n" -H "Authorization: Bearer %TOKEN_ADMIN%" %BASE%/clinic/CLINIC_A/revenue

echo.
echo === TEST 8: VETERINARIO accede a clinic ^(debe ser 403^) ===
curl -s -w "\nHTTP: %%{http_code}\n" -H "Authorization: Bearer %TOKEN_VET%" %BASE%/clinic/CLINIC_A

echo.
echo === TEST 9: Token invalido ^(debe ser 401^) ===
curl -s -w "\nHTTP: %%{http_code}\n" -H "Authorization: Bearer token_inventado_invalido" %BASE%/global

echo.
echo === TESTS COMPLETADOS ===
endlocal
