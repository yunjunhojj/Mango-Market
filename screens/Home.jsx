import { useFocusEffect } from "@react-navigation/native";
import Post from "../components/Post";
import React, { useCallback, useEffect } from "react";
import { useState } from "react";
import { FlatList, SafeAreaView } from "react-native";
import * as Font from "expo-font";
import { useColorScheme } from "react-native";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { authService, dbService } from "../firebase.js";
import styled from "@emotion/native";
import { SCREEN_HEIGHT } from "../util";

export default function Home({ navigation: { navigate, reset } }) {
  const isDark = useColorScheme() === "dark";
  const [posts, setPosts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFontReady, setIsFontReady] = useState(false);


  const getPostDate = () => {
    const q = query(
      collection(dbService, "posts"),
      orderBy("date", "desc"),
      where("isDone", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts(newPosts);
    });
    return unsubscribe;
  };
  useFocusEffect(
    useCallback(() => {
      if (!authService.currentUser) {
        // 로그인 X
        reset({
          index: 1,
          routes: [
            {
              name: "Tabs",
              params: {
                screen: "Home",
              },
            },
            {
              name: "Stacks",
              params: {
                screen: "Login",
              },
            },
          ],
        });
        return;
      }
      getPostDate();
    }, [])
  );
  //새로고침
  const onRefresh = async () => {
    setIsRefreshing(true);
    await getPostDate();
    setIsRefreshing(false);
  };

  // 폰트 비동기 처리
  useEffect(() => {
    fontLoad();
  }, []);
  const fontLoad = async () => {
    await Font.loadAsync({
      korail: require("../assets/fonts/Korail_Round_Gothic_Bold.ttf"),
    });
    setIsFontReady(true);
  };

  return (
    <HomeCotainer>
      <SafeAreaView
        style={
          isDark ? { backgroundColor: "#1c1e26" } : { backgroundColor: "white" }
        }
      >
        {isFontReady && (
          <>
            <Header>
              <TitleText>망고마켓</TitleText>
            </Header>
            <FlatList
              style={
                isDark
                  ? { backgroundColor: "#1c1e26", marginBottom: 110 }
                  : { backgroundColor: "white", marginBottom: 110 }
              }
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              data={posts}
              renderItem={({ item }) => <Post item={item} />}
              keyExtractor={(item) => item.id}
            />
          </>
        )}
      </SafeAreaView>
    </HomeCotainer>
  );
}

const SafeAreaViewContainer = styled.View`
  background-color: ${(props) => props.theme.backgroundColor};
`;
const HomeCotainer = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.backgroundColor};
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.backgroundColor};

  height: ${SCREEN_HEIGHT / 8 + "px"};
  margin-top: 10px;
`;
const TitleText = styled.Text`
  /* text-shadow: 1px 2px 2px; */
  font-family: korail;
  font-size: 40px;
  font-weight: 5;

  color: #f4cd43;
  /* color: #d1d1d179; */
`;
