require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const port = process.env.PORT || 3000;

// Создаем Discord клиент
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ] 
});

// Подключаемся к Discord
client.login(process.env.DISCORD_TOKEN);

// Middleware для CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Основной маршрут API
app.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id;
    
    if (!userId) {
      return res.status(400).json({ error: 'Не указан user_id' });
    }

    // Ищем пользователя
    const user = await client.users.fetch(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Формируем ответ
    const response = {
      name: user.username,
      displayname: user.globalName || user.username,
      avatar: user.displayAvatarURL({ size: 1024 })
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Произошла ошибка', details: error.message });
  }
});

// Запускаем сервер после подключения к Discord
client.on('ready', () => {
  console.log(`Бот ${client.user.tag} готов!`);
  app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
    console.log(`Пример запроса: http://localhost:${port}/?user_id=123456789`);
  });
});

client.on('error', console.error);
