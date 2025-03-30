curl - X POST http://localhost:3001/send-message \
-H "Content-Type: application/json" \
-d '{
"to": "51988301243"
}'



curl - X POST http://localhost:3000/send-message \
-H "Content-Type: application/json" \
-d '{
"to": "51976944301",
    "message": "¡Hola, este es un mensaje de prueba desde la API de WhatsApp!"
}'

curl - X POST http://localhost:3001/show-usuario \
-H "Content-Type: application/json"

POST /registrar-usuario HTTP/1.1
Host: localhost:3001
Content-Type: application/json
Content-Length: 465

{
    "RUC":"20606058200",
    "razon_social": "Fragote Software Factory",
    "direccion":"Las margaritas 181",
    "email":"francis@fragote.com",
    "api_key": "615332014992887",
    "token":"EAA4UBHuigRoBO1ro07cksMiB4mznZAKii3xGrobRmKc06V6PDfnMMptZC1gePyPc2wUm6ghumr1dZCwqFhdP6iqvz3ZBCJnAgRCPO548ExIJAnuzvnUziFZAqbvIp0Wj0KzKo8JWRNK63Yb3ZBK2uG248F3DesclKqQILTZCq3ylbZB5M5VNrLwgFIhdXGOr66YDxR2XZA5GkGkCpTI3LxKk5u8Oq",
    "bussines_id":"666154952475906"
}
