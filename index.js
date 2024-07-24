const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// EJS 템플릿 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 기본 라우트 설정
app.get('/', (req, res) => {
  res.render('index'); // 'views/index.ejs' 파일을 렌더링
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
