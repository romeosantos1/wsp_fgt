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

curl -X POST http://localhost:3001/registrar-usuario -H "Content-Type: application/json" -d '{
    "RUC": "20606058200",
    "razon_social": "Fragote Software Factory",
  "direccion":"Las margaritas 181",
  "email":"francis@fragote.com","api_key": "615332014992887","token":"EAA4UBHuigRoBO0ab8TJzVkVnFVD0sOTJ0whuBZAhJFUAkvwFVhXZCIdRxABuGcHcZBuZCv7aotoJMKZBSxjuS31MU6jDEdRChZApbyAT2v9i4rc8R8hQcTUZC92hzklSbeAmr8VNIPPOXt8FZBicOM2XlfwkvwKoXKxfRM1OUfPk0fPauD7NZALKIqZBl7PACPMudmArLdiGteuIfj6BrtbzZAZAucIs"
  }'
