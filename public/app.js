
const sideLinks = document.querySelectorAll('.sidebar .side-menu li a:not(.logout)');

sideLinks.forEach(item => {
  const li = item.parentElement;
  item.addEventListener('click', () => {
    sideLinks.forEach(i => {
      i.parentElement.classList.remove('active');
    })
    li.classList.add('active');
  })
});

const menuBar = document.querySelector('.content nav .bx.bx-menu');
const sideBar = document.querySelector('.sidebar');

menuBar.addEventListener('click', () => {
  sideBar.classList.toggle('close');
});

const searchBtn = document.querySelector('.content nav form .form-input button');
const searchBtnIcon = document.querySelector('.content nav form .form-input button .bx');
const searchForm = document.querySelector('.content nav form');

searchBtn.addEventListener('click', function (e) {
  if (window.innerWidth < 576) {
    e.preventDefault;
    searchForm.classList.toggle('show');
    if (searchForm.classList.contains('show')) {
      searchBtnIcon.classList.replace('bx-search', 'bx-x');
    } else {
      searchBtnIcon.classList.replace('bx-x', 'bx-search');
    }
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth < 768) {
    sideBar.classList.add('close');
  } else {
    sideBar.classList.remove('close');
  }
  if (window.innerWidth > 576) {
    searchBtnIcon.classList.replace('bx-x', 'bx-search');
    searchForm.classList.remove('show');
  }
});

const toggler = document.getElementById('theme-toggle');

toggler.addEventListener('change', function () {
  if (this.checked) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
});

/**--------------------------------------- Chart ------------------------------------------ */
// Tạo dữ liệu cho trục x (labels)
const labels = [];
const temperatureData = [];
const humidityData = [];

const chart = new Chart(
  document.getElementById('myChart'),
  {
    type: 'line',
    options: {
      animation: {
        duration: 1000, // Thời gian hoạt hình mỗi lần cập nhật (1 giây)
      },
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          enabled: true,
        },
      },
    },
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Temperature',
          data: temperatureData,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          fill: false,
          tension: 0.4,
          pointRadius: 2,
          pointStyle: 'circle', // Set the point style to 'circle'
          pointBackgroundColor: 'rgba(75, 192, 192, 1)', // Set the point color
        },
        {
          label: 'Humidity',
          data: humidityData,
          borderColor: 'rgba(192, 75, 192, 1)',
          borderWidth: 1,
          fill: false,
          tension: 0.4,
          pointRadius: 2,
          pointStyle: 'circle', // Set the point style to 'circle'
          pointBackgroundColor: 'rgba(192, 75, 192, 1)', // Set the point color
        },
      ],
    },
  }
);

// function updateChartData() {
//   // Lấy nhiệt độ và độ ẩm mới
//   const newTemperature = getNewTemperatureData(); // Thay thế hàm này bằng cách lấy dữ liệu nhiệt độ mới
//   const newHumidity = getNewHumidityData(); // Thay thế hàm này bằng cách lấy dữ liệu độ ẩm mới
//   const currentTime = new Date();

//   // Thêm nhiệt độ và độ ẩm mới vào mảng dữ liệu
//   temperatureData.push(newTemperature);
//   humidityData.push(newHumidity);

//   // Thêm nhãn thời gian mới vào mảng nhãn
//   labels.push(currentTime.getHours() + "H");

//   // Giới hạn mảng nhãn và dữ liệu chỉ trong 24 giờ
//   if (labels.length > 24) {
//     labels.shift(); // Xóa nhãn cũ nhất
//     temperatureData.shift(); // Xóa dữ liệu nhiệt độ cũ nhất
//     humidityData.shift(); // Xóa dữ liệu độ ẩm cũ nhất
//   }

//   // Cập nhật biểu đồ
//   chart.update();
// }

// // Gọi hàm `updateChartData()` ban đầu và sau mỗi 5 phút
// updateChartData();
// setInterval(updateChartData, 5 * 60 * 1000); // Cập nhật mỗi 5 phút (5 * 60 * 1000 ms)


function addTemperature(chart, newData) {
  const newHour = new Date().getHours();
  const newMinute = new Date().getMinutes();
  const newTimeLabel = `${newHour}:${newMinute}`;
  chart.data.labels.push(newTimeLabel);
  chart.data.datasets[0].data.push(newData);

  // Giới hạn số lượng điểm hiển thị trên biểu đồ theo thời gian
  const maxDataPointsInTimeRange = MAX_DATA_POINTS;
  if (chart.data.labels.length > maxDataPointsInTimeRange) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  chart.update();
}

function addHumidity(chart, newData) {
  const newHour = new Date().getHours();
  const newMinute = new Date().getMinutes();
  const newTimeLabel = `${newHour}:${newMinute}`;
  chart.data.labels.push(newTimeLabel);
  chart.data.datasets[1].data.push(newData);

  // Giới hạn số lượng điểm hiển thị trên biểu đồ theo thời gian
  const maxDataPointsInTimeRange = MAX_DATA_POINTS;
  if (chart.data.labels.length > maxDataPointsInTimeRange) {
    chart.data.labels.shift();
    chart.data.datasets[1].data.shift();
  }

  chart.update();
}

/* ============================= MQTT ================================= */
let mqttClient;
const MAX_HOURS = 24;
const MAX_DATA_POINTS = 100;
var POINTS = 0;

window.addEventListener("load", (event) => {
  connectToBroker();
  document.getElementById("day").innerHTML = new Date().getDate();
  document.getElementById("month").innerHTML = new Date().getMonth() + 1;
  document.getElementById("year").innerHTML = new Date().getFullYear();
});

function connectToBroker() {
  const clientId = "client" + Date.now();
  const host = "wss://172.20.107.226:8084/ws";
  
  const caPath = "/certificates/ca.crt";
  const certPath = "/certificates/server.crt";
  const keyPath = "/certificates/server.key";

  // Fetch CA certificate
  fetch(caPath)
    .then(response => response.text())
    .then(ca => {
      // Fetch client certificate
      fetch(certPath)
        .then(response => response.text())
        .then(cert => {
          // Fetch private key
          fetch(keyPath)
            .then(response => response.text())
            .then(key => {
              const options = {
                keepalive: 60,
                clientId: clientId,
                protocolId: "MQTT",
                protocolVersion: 4,
                clean: true,
                reconnectPeriod: 1000,
                connectTimeout: 30 * 1000,
                ca: ca,
                cert: cert,
                key: key,
              };

              const mqttClient = mqtt.connect(host, options);
              mqttClient.on("error", (err) => {
                console.log("Error: ", err);
                mqttClient.end();
              });

              mqttClient.on("reconnect", () => {
                console.log("Reconnecting...");
              });

              mqttClient.on('connect', function () {
                console.log('Đã kết nối tới MQTT broker');

                // Đăng ký sự kiện lắng nghe tin nhắn với chủ đề "led
                mqttClient.subscribe("LedKitchen", { qos: 0 });
                mqttClient.subscribe("LedBedRoom", { qos: 0 });
                mqttClient.subscribe("Fan", { qos: 0 });
                mqttClient.subscribe("temperature kitchen", { qos: 0 });
                mqttClient.subscribe("humidity kitchen", { qos: 0 });
                mqttClient.subscribe("temperture bedroom", { qos: 0 });
                mqttClient.subscribe("humidity bedroom", { qos: 0 });

              });
              // Received
              mqttClient.on('message', function (topic, message) {
                let temp1;
                let humi1;
                if (topic === 'LedKitchen') {
                  console.log('Nhận được tin nhắn với chủ đề "LedKitchen": ' + message.toString());
                  const value = message.toString();
                  if (value === "ON") {
                    myCheckbox1.checked = true;
                  } else {
                    myCheckbox1.checked = false;
                  }
                }
                if (topic === 'LedBedRoom') {
                  console.log('Nhận được tin nhắn với chủ đề "LedBedRoom": ' + message.toString());
                  // Chuyển giá trị tin nhắn thành số nguyên
                  const value = message.toString();
                  // Kiểm tra giá trị của "led" và cập nhật trạng thái của checkbox
                  if (value === "Open") {
                    myCheckbox2.checked = true;
                  } else {
                    myCheckbox2.checked = false;
                  }
                }
                if (topic === 'Fan') {
                  console.log('Nhận được tin nhắn với chủ đề "Fan": ' + message.toString());
                  // Chuyển giá trị tin nhắn thành số nguyên
                  const value = message.toString();
                  // Kiểm tra giá trị của "led" và cập nhật trạng thái của checkbox
                  if (value === "Open") {
                    myCheckbox3.checked = true;
                  } else {
                    myCheckbox3.checked = false;
                  }
                }
                if (topic == 'temperature bedroom') {
                  document.getElementById('temp-living').innerHTML = message.toString();
                  temp1 = parseFloat(message);
                  console.log('Temperature bedroom: ' + message.toString() + typeof (message));
                  addTemperature(chart, temp1);
                }
                if (topic == 'humidity bedroom') {
                  document.getElementById('hum-living').innerHTML = message.toString();
                  humi1 = parseFloat(message);
                  console.log('Humidity bedroom: ' + message.toString() + typeof { message });
                  addHumidity(chart, humi1);
                }
                if (topic == 'temperature kitchen') {
                  document.getElementById('temp-kitchen').innerHTML = message.toString();
                  temp1 = parseFloat(message);
                  console.log('Temperature kitchen: ' + message.toString() + typeof (message));
                }
                if (topic == 'humidity kitchen') {
                  document.getElementById('hum-kitchen').innerHTML = message.toString();
                  humi1 = parseFloat(message);
                  console.log('Humidity kitchen: ' + message.toString() + typeof { message });
                }
              });
            });
        });
    });
}

function ChangeStatus(mycheckbox, state, status1, status2) {
  const myCheckbox = document.getElementById(mycheckbox);

  // Add an event listener to the checkbox
  myCheckbox.addEventListener("change", function () {
    if (myCheckbox.checked) {
      document.getElementById(state).innerHTML = status1;
      console.log(state + " - " + status1);
      // Publish using your MQTT client (make sure mqttClient is defined and configured)
      mqttClient.publish(state, status1, {
        qos: 0,
        retain: false,
      });
    } else {
      document.getElementById(state).innerHTML = status2;
      console.log(state + " - " + status2);
      // Publish using your MQTT client (make sure mqttClient is defined and configured)
      mqttClient.publish(state, status2, {
        qos: 0,
        retain: false,
      });
    }
  });
}

// Usage example:
ChangeStatus("myCheckbox1", 'LedBedRoom', "ON", "OFF");
ChangeStatus("myCheckbox2", "LedKitchen", "Open", "Close");
ChangeStatus("myCheckbox3", "Fan", "Open", "Close");


