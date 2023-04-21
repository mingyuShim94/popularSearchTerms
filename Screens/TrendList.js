import React, { useEffect, useState, useRef } from "react";
import {
  Animated,
  Pressable,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "react-query";
import { trendInfo } from "../Utils/Api";
import { crawlImage } from "../Utils/NewsCrawl";
import { useFonts } from "expo-font";
import styled from "styled-components/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Modal from "react-native-modal";
import Share from "react-native-share";
import ViewShot from "react-native-view-shot";
import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ReactNativeZoomableView from "@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView";
import { decode } from "html-entities";
import { TestIds, useInterstitialAd } from "react-native-google-mobile-ads";
const bannerAdUnitId = __DEV__
  ? TestIds.BANNER
  : "ca-app-pub-8647279125417942/7503277814";
const interAdUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : "ca-app-pub-8647279125417942/7107857884";

const WindowWidth = Dimensions.get("window").width;
const WindowHeight = Dimensions.get("window").height;
let url;
const TrendList = ({ navigation, navigation: { addListener } }) => {
  const {
    isLoading: trendLoading,
    data: trendData,
    refetch: refresh,
    remove,
  } = useQuery("trendInfo", trendInfo);

  const {
    isLoading: newsImgLoading,
    data: newsImgUrl,
    refetch: getNewsImg,
  } = useQuery(["crawlImage", { trendData: trendData }], crawlImage, {
    enabled: false,
    retry: false,
  });
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(0);
  const [newsIsOpened, setNewsIsOpened] = useState(false);
  const [newsCount, setNewsCount] = useState(1);
  const [blankData, setBlankData] = useState(
    Array.from({ length: 20 }, (v, i) => i)
  );
  const {
    isLoaded: interIsLoaded,
    isClosed: interIsClosed,
    load: interLoad,
    show: interShow,
  } = useInterstitialAd(interAdUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  useEffect(() => {
    // console.log("interLoad!!", interIsLoaded);
    interLoad();
  }, [interLoad]);

  useEffect(() => {
    // console.log(newsIsOpened);
    if (newsIsOpened?.type == "dismiss" && newsCount % 3 == 0) interShow();
  }, [newsIsOpened]);

  useEffect(() => {
    if (interIsClosed) {
      console.log("InterClose!!");
      interLoad();
    }
  }, [interIsClosed]);

  const openArticleLink = async () => {
    const webLink =
      trendData[isClicked]["ht:news_item"][0]["ht:news_item_url"][0];
    let result = await WebBrowser.openAuthSessionAsync(webLink);
    setNewsIsOpened(result);
    setNewsCount((prev) => prev + 1);
  };

  useEffect(() => {
    console.log(trendLoading);
    if (!trendLoading) {
      getNewsImg();
    }
  }, [trendLoading]);

  useEffect(() => {
    if (trendLoading == false) {
      navigation.setOptions({
        title: trendData[isClicked].title[0],
      });
    }
  }, [trendLoading, isClicked]);
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            remove();
            refresh();
          }}
        >
          <Ionicons name="ios-refresh-outline" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, []);
  const ItemContents = (item, index, click) => (
    <RowView>
      <Text style={{ fontSize: 20, alignSelf: "center", marginLeft: 10 }}>
        {index + 1}
      </Text>
      <ListImageBox>
        {item["ht:picture"] == undefined ? (
          <MaterialCommunityIcons
            name="image-off-outline"
            size={35}
            color="black"
          />
        ) : (
          <Image
            style={{
              height: "100%",
              width: "100%",
              borderRadius: 10,
              resizeMode: "cover",
            }}
            source={{
              uri: item["ht:picture"][0],
            }}
          />
        )}
      </ListImageBox>
      <ListTextBox>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: click ? "black" : "black",
          }}
        >
          {item.title[0]}
        </Text>
        <Text
          numberOfLines={2}
          style={{
            marginTop: 3,
            fontSize: 13,
            color: click ? "black" : "black",
          }}
        >
          {decode(item["ht:news_item"][0]["ht:news_item_title"][0])}
        </Text>
      </ListTextBox>
    </RowView>
  );

  return trendLoading ? (
    <WindowContainer>
      <TopView>
        <TopImageBox></TopImageBox>
      </TopView>
      <ListView
        data={blankData}
        keyExtractor={(item, index) => index}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item, index }) => {
          return <ListItemBox></ListItemBox>;
        }}
      ></ListView>
    </WindowContainer>
  ) : (
    <WindowContainer>
      <TopView>
        {isClicked == null ? null : (
          <>
            <TopImageBox
              onPress={() => {
                setImageModalVisible(true);
              }}
            >
              {newsImgUrl == undefined ? (
                <MaterialCommunityIcons
                  name="image-off-outline"
                  size={35}
                  color="black"
                />
              ) : (
                <Image
                  style={{
                    height: "100%",
                    width: "100%",
                    borderRadius: 10,
                    resizeMode: "cover",
                  }}
                  source={{
                    uri: newsImgUrl[isClicked],
                  }}
                />
              )}

              <AntDesign
                name="pluscircle"
                size={24}
                color="black"
                style={{ position: "absolute", bottom: 5, right: 5, zIndex: 1 }}
              />
              <View
                style={{
                  width: 17,
                  height: 17,
                  borderRadius: 8,
                  backgroundColor: "white",
                  position: "absolute",
                  bottom: 9.5,
                  right: 9.5,
                  zIndex: 0,
                }}
              />
            </TopImageBox>
            <TopTextBox onPress={() => openArticleLink()}>
              {trendData == undefined ? null : (
                <Text style={{ color: "black" }}>
                  {decode(
                    trendData[isClicked]["ht:news_item"][0][
                      "ht:news_item_snippet"
                    ][0]
                  )}
                </Text>
              )}

              <Ionicons
                name="newspaper"
                size={20}
                color="black"
                style={{ position: "absolute", right: 5, bottom: 5 }}
              />
            </TopTextBox>
          </>
        )}
      </TopView>
      <ListView
        data={trendData}
        keyExtractor={(item, index) => index}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item, index }) => {
          //   console.log("index", index);
          //   console.info(item["ht:news_item"][0]["ht:news_item_title"][0]);
          return index == isClicked ? (
            <ListClickedItemBox onPress={() => openArticleLink()}>
              {ItemContents(item, index, true)}
            </ListClickedItemBox>
          ) : (
            <ListItemBox
              onPress={async () => {
                console.log(index);
                setIsClicked(index);
                // getCrawlImg(index);
              }}
            >
              {ItemContents(item, index, false)}
            </ListItemBox>
          );
        }}
      ></ListView>
      <Modal
        isVisible={isImageModalVisible}
        backdropOpacity={0.7}
        useNativeDriver={true}
        animationIn={"zoomIn"}
        animationOut={"zoomOut"}
        onBackButtonPress={() => {
          setImageModalVisible(false);
        }}
        onBackdropPress={() => {
          setImageModalVisible(false);
        }}
      >
        <ImageModal>
          <ReactNativeZoomableView
            maxZoom={2.5}
            minZoom={1}
            initialZoom={1}
            bindToBorders={true}
          >
            {newsImgUrl == undefined ? (
              <MaterialCommunityIcons
                name="image-off-outline"
                size={35}
                color="black"
              />
            ) : (
              <Image
                style={{
                  width: WindowWidth,
                  height: WindowHeight,
                  resizeMode: "contain",
                }}
                source={{ uri: newsImgUrl[isClicked] }}
              />
            )}
          </ReactNativeZoomableView>
          <TouchableOpacity
            style={{ position: "absolute", bottom: 13 }}
            onPress={() => setImageModalVisible(false)}
          >
            <View
              style={{
                backgroundColor: "white",
                width: 28,
                height: 28,
                borderRadius: 15,
                alignSelf: "center",
                bottom: 5,
                borderWidth: 3,
                borderColor: "black",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={20} color="black" />
            </View>
          </TouchableOpacity>
        </ImageModal>
      </Modal>
    </WindowContainer>
  );
};

export default TrendList;

const ImageModal = styled.Pressable`
  justify-content: center;
  align-items: center;
  background-color: black;
  align-self: center;
`;

const WindowContainer = styled.View`
  flex: 1;
  background-color: white;
`;
const TopView = styled.View`
  flex: 0.3;
  background-color: #eef1ff;
  flex-direction: row;
`;

const TopImageBox = styled.Pressable`
  width: 170px;
  height: 170px;
  background-color: white;
  border-radius: 10px;
  margin-left: 10px;
  align-self: center;
  justify-content: center;
  align-items: center;
`;
const TopTextBox = styled.Pressable`
  width: 200px;
  height: 200px;
  margin-left: 13px;
  margin-vertical: 10px;
  align-self: center;
  align-items: center;
  justify-content: center;
  //background-color: white;
`;
const ListView = styled.FlatList`
  flex: 0.7;
  background-color: white;
  padding-top: 10px;
  padding-bottom: 10px;
`;
const ListItemBox = styled.Pressable`
  width: ${WindowWidth * 0.9}px;
  height: 100px;
  background-color: white;
  align-self: center;
  border-radius: 10px;
  justify-content: center;
  elevation: 10;
`;
const ListClickedItemBox = styled.Pressable`
  width: ${WindowWidth}px;
  height: 100px;
  background-color: #eef1ff;
  align-self: center;
  justify-content: center;
`;
const RowView = styled.View`
  flex-direction: row;
`;
const ListImageBox = styled.View`
  width: 75px;
  height: 75px;
  background-color: grey;
  border-radius: 10px;
  margin-left: 10px;
  align-items:center
  justify-content: center;
`;
const ListTextBox = styled.View`
  margin-left: 10px;
  width: 230px;
  height: 70px;
  //background-color: red;
`;
