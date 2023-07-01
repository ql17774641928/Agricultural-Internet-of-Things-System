const mqtt = require('mqtt');
const mysql = require('mysql');
const express = require('express');
const cors = require('cors');//解决跨域问题
const app = express();
app.use(cors());
app.use(express.json());
let alertId = 65; // 警报记录对应的数据的初始 id 值
let lastDataId;//data表中最后一条数据的 id 值

// 连接 MQTT 代理
const mqttClient = mqtt.connect('ws://emqx@127.0.0.1:8083/mqtt');

// MySQL 数据库连接配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'database3'
};

// 创建 MySQL 连接
const dbConnection = mysql.createConnection(dbConfig);

// 连接到 MySQL 数据库
dbConnection.connect((err) => {
  if (err) {
    console.error('无法连接到 MySQL 数据库:', err);
    return;
  }
  console.log('已成功连接到 MySQL 数据库');
});

// 在连接成功后打印日志
mqttClient.on('connect', () => {
  console.log('成功连接到 MQTT 代理');
});

//添加了一个 /autoControl 路由，用于接收来自前端的开启/关闭自动控制的请求。根据请求中的 enabled 值，
//将更新全局变量 autoControlEnabled，以便在处理温度和光照度判断时进行适当的调整。
let autoControlEnabled
app.post('/autoControl', (req, res) => {
  const { enabled } = req.body;
  autoControlEnabled = enabled;
  res.json({ success: true, enabled });
});

// 在收到消息后处理数据并存入 MySQL 数据库
mqttClient.on('message', (topic, message) => {
  console.log(`收到主题为 ${topic} 的消息：${message.toString()}`);

  // 将接收到的 JSON 数据解析为对象
  const data = JSON.parse(message.toString());

  // 插入数据到 MySQL 数据库的 SQL 语句
  const insertQuery = `INSERT INTO data (temperature, time, humidity, illumination) VALUES ('${data.temperature}', '${data.time}', '${data.humidity}', '${data.illumination}')`;
 //每插入一条数据，alertId++
  alertId++;

// 判断温度是否高于35
  if (data.temperature > 35&&autoControlEnabled) {
    // 查询数据库获取符合条件的指令
    const query = `SELECT * FROM command WHERE deviceid = 1 AND \`order\` = 'open'`;
    dbConnection.query(query, (error, results) => {
      if (error) { 
        console.error('查询指令失败:', error);
        return;
      }

      // 检查是否有匹配的指令
      if (results.length > 0) {
        const command = results[0]; // 假设只取第一个匹配的指令

        // 向 MQTT 发布主题为 test2/topic 的消息，包含从数据库中查询到的指令
        const topic = 'test2/topic';
        const message = JSON.stringify(command);
        mqttClient.publish(topic, message);

        // 更新设备表对应设备的状态为 "open"
        const updateDeviceQuery = `UPDATE device SET status = 'open' WHERE id = ${command.deviceid}`;
        dbConnection.query(updateDeviceQuery, (updateError, updateResult) => {
          if (updateError) {
            console.error('更新设备状态失败:', updateError);
            return;
          }
          console.log('设备状态更新成功:', updateResult);
        });
      } else {
        console.log('没有匹配的指令');
      }
    });
  }
  

// 判断温度是否高于40
if (data.temperature > 40&&autoControlEnabled) {
  // 查询数据库获取符合条件的指令
  const query = `SELECT * FROM command WHERE deviceid = 2 AND \`order\` = 'open'`;
  dbConnection.query(query, (error, results) => {
    if (error) {
      console.error('查询指令失败:', error);
      return;
    }

    // 检查是否有匹配的指令
    if (results.length > 0) {
      const command = results[0]; // 假设只取第一个匹配的指令

      // 向 MQTT 发布主题为 test2/topic 的消息，包含从数据库中查询到的指令
      const topic = 'test2/topic';
      const message = JSON.stringify(command);
      mqttClient.publish(topic, message);

      // 更新设备表对应设备的状态为 "open"
      const updateDeviceQuery = `UPDATE device SET status = 'open' WHERE id = ${command.deviceid}`;
      dbConnection.query(updateDeviceQuery, (updateError, updateResult) => {
        if (updateError) {
          console.error('更新设备状态失败:', updateError);
          return;
        }
        console.log('设备状态更新成功:', updateResult);
      });
    } else {
      console.log('没有匹配的指令');
    }
  });
}


 // 判断温度是否低于20
 if (data.temperature < 20&&autoControlEnabled) {
  // 查询数据库获取符合条件的指令
  const query = `SELECT * FROM command WHERE deviceid IN (1, 2) AND \`order\` = 'close'`;
  dbConnection.query(query, (error, results) => {
    if (error) {
      console.error('查询指令失败:', error);
      return;
    }

    // 遍历查询结果，向 MQTT 发布主题为 test2/topic 的消息，包含从数据库中查询到的指令
    results.forEach(command => {
      const topic = 'test2/topic';
      const message = JSON.stringify(command);
      mqttClient.publish(topic, message);

      // 更新设备表对应设备的状态为 "close"
      const updateDeviceQuery = `UPDATE device SET status = 'close' WHERE id = ${command.deviceid}`;
      dbConnection.query(updateDeviceQuery, (updateError, updateResult) => {
        if (updateError) {
          console.error('更新设备状态失败:', updateError);
          return;
        }
        console.log('设备状态更新成功:', updateResult);
      });
    });
  });
}


// 判断光照度是否低于10
if (data.illumination < 10&&autoControlEnabled) {
  // 查询数据库获取符合条件的指令
  const query = `SELECT * FROM command WHERE deviceid = 3 AND \`order\` = 'open'`;
  dbConnection.query(query, (error, results) => {
    if (error) {
      console.error('查询指令失败:', error);
      return;
    }
    // 检查是否有匹配的指令
    if (results.length > 0) {
      const command = results[0]; // 取第一个匹配的指令

      // 向 MQTT 发布主题为 test2/topic 的消息，包含从数据库中查询到的指令
      const topic = 'test2/topic';
      const message = JSON.stringify(command);
      mqttClient.publish(topic, message);

      // 更新设备表对应设备的状态为 "open"
      const updateDeviceQuery = `UPDATE device SET status = 'open' WHERE id = ${command.deviceid}`;
      dbConnection.query(updateDeviceQuery, (updateError, updateResult) => {
        if (updateError) {
          console.error('更新设备状态失败:', updateError);
          return;
        }
        console.log('设备状态更新成功:', updateResult);
      });
    } else {
      console.log('没有匹配的指令');
    }
 
  });
}


// 判断光照度是否高于30
if (data.illumination > 30&&autoControlEnabled) {
  // 查询数据库获取符合条件的指令
  const query = `SELECT * FROM command WHERE deviceid = 3 AND \`order\` = 'close'`;
  dbConnection.query(query, (error, results) => {
    if (error) {
      console.error('查询指令失败:', error);
      return;
    }
    // 检查是否有匹配的指令
    if (results.length > 0) {
      const command = results[0]; // 取第一个匹配的指令

      // 向 MQTT 发布主题为 test2/topic 的消息，包含从数据库中查询到的指令
      const topic = 'test2/topic';
      const message = JSON.stringify(command);
      mqttClient.publish(topic, message);

      // 更新设备表对应设备的状态为 "open"
      const updateDeviceQuery = `UPDATE device SET status = 'close' WHERE id = ${command.deviceid}`;
      dbConnection.query(updateDeviceQuery, (updateError, updateResult) => {
        if (updateError) {
          console.error('更新设备状态失败:', updateError);
          return;
        }
        console.log('设备状态更新成功:', updateResult);
      });
    } else {
      console.log('没有匹配的指令');
    }
 
  });
}
  // 判断温度和光照是否触发警报
  if (data.temperature < 22 || data.temperature > 30) {
    const getLastDataIdQuery = 'SELECT id FROM data ORDER BY id DESC LIMIT 1';
    dbConnection.query(getLastDataIdQuery, (err, result) => {
      if (err) {
        console.error('无法获取最后一条数据的 id 值:', err);
        return;
      }
      lastDataId = result.length > 0 ? result[0].id : 0;
      
      const temperatureAlert = {
        //id: alertId++,
        type: 'temperature',
        value: data.temperature,
        time: new Date().toLocaleString(),
        dataid:lastDataId+1
      };
      insertAlert(temperatureAlert);
    });
  }
   

  
  if (data.illumination < 15 || data.illumination > 25) {
    const getLastDataIdQuery = 'SELECT id FROM data ORDER BY id DESC LIMIT 1';
    dbConnection.query(getLastDataIdQuery, (err, result) => {
      if (err) {
        console.error('无法获取最后一条数据的 id 值:', err);
        return;
      }
      lastDataId = result.length > 0 ? result[0].id : 0;
      const illuminationAlert = {
        //id: alertId++,
        type: 'illumination',
        value: data.illumination,
        time: new Date().toLocaleString(),
        dataid:lastDataId+1
      };
      insertAlert(illuminationAlert);
    });

  }


  // 执行 SQL 插入语句
  dbConnection.query(insertQuery, (err, result) => {
    if (err) {
      console.error('无法插入数据到 MySQL 数据库:', err);
      return;
    }
    console.log('数据插入成功:', result);
  });
});

// 插入警报记录到 alert 表
function insertAlert(alertData) {
  const {type, value, time, dataid } = alertData;
  const insertAlertQuery = `INSERT INTO alert (type, value, time, dataid) VALUES ('${type}', '${value}', '${time}', '${dataid}')`;
  
  dbConnection.query(insertAlertQuery, (err, result) => {
    if (err) {
      console.error('无法插入警报记录到 MySQL 数据库:', err);
      return;
    }
    console.log('警报记录插入成功:', result);
  });
}

// 处理 /data 路由的 GET 请求
app.get('/data', (req, res) => {
  // 执行查询 SQL 语句获取数据库中的数据
  const query = 'SELECT id, temperature, time, humidity, illumination FROM data';

  pool.query(query, (error, results) => {
    if (error) {
      console.error('查询数据出错:', error);
      res.status(500).send('查询数据出错');
    } else {
      res.json(results);
    }
  });
});


// 订阅主题
mqttClient.subscribe('test1/topic', (err) => {
  if (err) {
    console.error('订阅失败', err);
  } else {
    console.log('成功订阅主题 test1/topic');
  }
});


// 创建 MySQL 连接池
const pool = mysql.createPool(dbConfig);

// 处理 /search 路由的 GET 请求
app.get('/search', (req, res) => {
  const time = req.query.time;

  // 执行查询 SQL 语句
  const query = `SELECT * FROM data WHERE time = '${time}'`;

  pool.query(query, (error, results) => {
    if (error) {
      console.error('查询出错:', error);
      res.status(500).send('查询出错');
    } else {
      res.json(results);
    }
  });
});

// 添加设备的路由
app.post('/devices', (req, res) => {
  const deviceInfo = req.body.deviceInfo;

  // 解析设备信息
  const [name, type, status] = deviceInfo.split('-');

  // 构建插入命令的SQL语句
  const sql = `INSERT INTO device (name, type, status) VALUES (?, ?, ?)`;
  const values = [name.trim(), type.trim(), status.trim()];

  // 执行插入命令
  dbConnection.query(sql, values, (err, result) => {
    if (err) {
      console.error('无法插入设备:', err);
      res.status(500).json({ error: '无法插入设备' });
    } else {
      console.log('成功插入设备');
      res.sendStatus(200);
    }
  });
});




// 处理 /devices 路由的 GET 请求
app.get('/devices', (req, res) => {
  // 执行查询 SQL 语句获取设备表数据
  const query = 'SELECT id, name, type, status FROM device';

  pool.query(query, (error, results) => {
    if (error) {
      console.error('查询设备表出错:', error);
      res.status(500).send('查询设备表出错');
    } else {
      res.json(results);
    }
  });
});
//更新设备状态
app.put('/devices/:id', (req, res) => {
  const deviceId = req.params.id;
  const status = req.body.status;

  const updateQuery = `UPDATE device SET status = '${status}' WHERE id = ${deviceId}`;

  pool.query(updateQuery, (error, result) => {
    if (error) {
      console.error('更新设备状态出错:', error);
      res.status(500).send('更新设备状态出错');
    } else {
      res.send('设备状态已更新');
    }
  });
});

// 删除设备
app.delete('/devices/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const sql = 'DELETE FROM device WHERE id = ?';
  dbConnection.query(sql, [deviceId], (err, result) => {
    if (err) {
      console.error('删除设备出错:', err);
      res.status(500).json({ error: '无法删除设备' });
      return;
    }
    res.json({ message: '设备已删除' });
  });
});

// 处理 /alerts 路由的 GET 请求
app.get('/alerts', (req, res) => {
  // 执行查询 SQL 语句获取警告表数据
  const query = 'SELECT id, type, value, time, dataid FROM alert';

  pool.query(query, (error, results) => {
    if (error) {
      console.error('查询警告表出错:', error);
      res.status(500).send('查询警告表出错');
    } else {
      res.json(results);
    }
  });
});

//处理删除警告记录的路由
app.delete('/alerts/:id', (req, res) => {
  const alertId = req.params.id;
  const deleteQuery = `DELETE FROM alert WHERE id = ${alertId}`;

  dbConnection.query(deleteQuery, (error, result) => {
    if (error) {
      console.error('删除警告记录失败:', error);
      res.status(500).json({ success: false, message: '删除警告记录失败' });
    } else {
      console.log('警告记录删除成功');
      res.json({ success: true, message: '警告记录删除成功' });
    }
  });
});

app.post('/command', (req, res) => {
  const { deviceid, name, order } = req.body;

  // 将指令插入数据库的command表中
  const query = `SELECT deviceid, \`type\`, \`order\` FROM command WHERE deviceid = ${deviceid} AND \`order\` = '${order}'`;

  dbConnection.query(query, (error, results) => {
    if (error) {
      console.error('无法查找到对应设备的对应指令', error);
      res.status(500).json({ error: '无法查找到对应设备的对应指令' });
    } else {
      if (results.length > 0) {
        console.log('成功查找到对应设备的对应指令:', results);
        res.json({ success: true });

        // 发送MQTT指令
        sendMqttCommand(results[0]);
      } else {
        console.log('未找到对应设备的对应指令');
        res.json({ success: false });
      }
    }
  });
});

// 向 MQTT 代理发送指令
function sendMqttCommand(result) {
  const { deviceid, type, order } = result;
  const message = JSON.stringify({ deviceid, type, order });

  mqttClient.publish('test2/topic', message, (error) => {
    if (error) {
      console.error('发送MQTT指令失败:', error);
    } else {
      console.log('MQTT指令发送成功');
    }
  });
}


// 处理收到的指令
mqttClient.on('message', (topic, message) => {
  // 在此处理收到的MQTT指令
});


// 创建指令
app.post('/commands', (req, res) => {
  const {deviceid, type, order, time } = req.body;

  const query = 'INSERT INTO command (deviceid, type, `order`, time) VALUES (?, ?, ?, ?)';
  const values = [deviceid, type, order, time];

  dbConnection.query(query, values, (error, results) => {
    if (error) {
      console.error('Failed to create command', error);
      res.sendStatus(500);
    } else {
      console.log('Command created');
      res.sendStatus(201);
    }
  });
});

// 查询指令
app.get('/commands', (req, res) => {
  const query = 'SELECT * FROM command';

  dbConnection.query(query, (error, results) => {
    if (error) {
      console.error('Failed to fetch commands', error);
      res.sendStatus(500);
    } else {
      res.json(results);
    }
  });
});

// 删除指令的路由处理
app.delete('/commands/:id', (req, res) => {
  const commandId = req.params.id;
  
  const deleteCommandQuery = `DELETE FROM command WHERE id = ${commandId}`;
  
  dbConnection.query(deleteCommandQuery, (err, result) => {
    if (err) {
      console.error('删除指令出错:', err);
      res.status(500).json({ error: '删除指令失败' });
      return;
    }
    
    console.log('指令删除成功');
    res.sendStatus(200);
  });
});

// 监听端口
app.listen(3000, () => {
  console.log('服务器已启动，监听端口 3000');
});