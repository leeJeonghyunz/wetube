const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const BASE_JS = "./src/client/js/";

module.exports = {
  entry: {
    main: BASE_JS + "main.js",
    videoPlayer: BASE_JS + "videoPlayer.js",
    recorder: BASE_JS + "recorder.js",
    commentSection: BASE_JS + "commentSection.js",
  },
  // Entry는 우리가 처리하고자 하는 파일. 소스코드를 의미한다.
  // 객체로 관리할 수 있다. 이 방법으로 다른 파일들을 webpack으로 포함시킬 수 있다.
  mode: "development", // 개발? 배포? 모드설정
  watch: true, // 변경사항을 지속적으로 기억
  output: {
    filename: "js/[name].js",
    // 앞에 폴더이름을  집어넣어 폴더경로를 다르게 함.
    // [name]을 사용하여 여러 파일을 불러올 수 있음.
    path: path.resolve(__dirname, "assets"), // 저장 경로
    clean: true, // 폴더를 자동으로 지움
  }, // 결과물
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/styles.css", // css 파일의 이름 변경
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader", // js코드를 babel-loader라는 코드로 가공
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        // 로더는 마지막 실행할 것을 처음 작성해야 한다. 왜냐하면 webpack은 뒤에서부터 시작한다.
      },
    ],
  },
};
