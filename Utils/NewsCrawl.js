const cheerio = require("react-native-cheerio");
//'https://test.cors.workers.dev/?' +
export const crawlImage = async ({ queryKey }) => {
  //console.log("query", data);
  const [_, { trendData }] = queryKey;
  //   console.log(data[0]);
  const imgUrlArr = Array.from({ length: 20 }, (i) => i);
  await Promise.all(
    trendData.map(async (d, index) => {
      //console.log(index, d["ht:news_item"][0]["ht:news_item_url"][0]);
      const articleUrl = d["ht:news_item"][0]["ht:news_item_url"][0];
      // console.log("step1", index, articleUrl);
      if (articleUrl.includes("http") === false)
        articleUrl = `https://${articleUrl}`;
      let imgUrl;
      const response = await fetch(articleUrl);
      const data = await response.text();
      const $ = cheerio.load(data);
      const image = $(`meta[property="og:image"]`).attr("content");

      if (image.includes("http") == false) {
        imgUrl = `https:${image}`;
      } else {
        imgUrl = `${image}`;
      }
      //   console.log(index, imgUrl);
      imgUrlArr[index] = imgUrl;
    })
  );

  return imgUrlArr;
};
