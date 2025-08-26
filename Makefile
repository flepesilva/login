# Makefile

# Levanta los contenedores en segundo plano
docker-up:
	docker compose up -d

# Baja los contenedores
docker-down:
	docker compose down

# Inicia la aplicación en modo desarrollo
start:
	npm run start:dev

# Levanta Docker y luego inicia la app
up: docker-up start

# Reinicia todo (opcional)
restart: docker down up
