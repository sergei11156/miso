# Rain of Dudes 
Мультиплеерная гра для хакатона, написанная мной за 2 недели.
# Сборка
Сроки были ограничены и я не успел нормально контейнеризовать проект. Можно пропустить этот этап скачав релиз  
Если есть SSL сертификат, то замените файл app.ts на app.https.ts и поменяйте в нём пути к ключю и сертификату  
  
Необходимо выполнить в корне проекта и в папке /views
```
npm install
``` 
Далее в корне проекта запустить ```tsc```, а в /views запустить ```gulp``` и выключить, когда сборка закончиться

# Деплой: 
```
docker-compose up --build -d
```

Если запустили локально можно открыть два окна браузера и играть

