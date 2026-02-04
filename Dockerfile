# Минимальный образ, без Node, без npm
FROM alpine:3.19

# Куда складываем результат сборки
WORKDIR /dist

# Копируем УЖЕ собранный фронт из pipeline
# (npm run build уже был выполнен)
COPY dist/ .

# Контейнер ничего не запускает
# Он просто хранит артефакты сборки
CMD ["sh", "-c", "echo Frontend artifacts image ready"]
