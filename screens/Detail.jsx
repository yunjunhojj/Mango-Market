import { View, Text, ScrollView, Image } from "react-native";
import styled from "@emotion/native";
import { useEffect, useState } from "react";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { dbService } from "../firebase";
import { Alert } from "react-native";
import { authService } from "../firebase";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import CustomBtn from "../components/CustomBtn";
import * as Font from "expo-font";
import { APPLEMANGO_COLOR, GRAY_COLOR, MANGO_COLOR } from "../colors";
import EditDetail from "../components/EditDetail";
import Comments from "../components/Comments";

const brandColor = "#ffc800";

const Detail = (props) => {
  const [detailItem, setDetailItem] = useState(null);
  const [isFontReady, setIsFontReady] = useState(false);

  const { navigate } = useNavigation();
  const currentId = authService.currentUser.email;
  const itemId = props.route.params.postId;
  const userId = props.route.params.userId;
  // const userName = detailItem.userId.splite("@")[0];

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
    }, [])
  );

  // 데이터 불러오기
  const getData = async () => {
    const docRef = doc(dbService, "posts", itemId);
    const docSnap = await getDoc(docRef);

    const newDetailItem = {
      id: docSnap.id,
      ...docSnap.data(),
    };
    setDetailItem(newDetailItem);
  };

  useEffect(() => {
    fontLoad();
    getData();
  }, []);

  const setEdit = async (detailItem) => {
    setDetailItem({ ...detailItem, isEdit: !detailItem.isEdit });
  };

  const deleteBoard = () => {
    Alert.alert("작성 글 삭제", "정말 삭제하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(dbService, "posts", itemId));
          Alert.alert("삭제 완료");
          navigate("Home");
        },
      },
    ]);
  };

  // 폰트 비동기 처리

  const fontLoad = async () => {
    await Font.loadAsync({
      korail: require("../assets/fonts/Korail_Round_Gothic_Bold.ttf"),
    });
    setIsFontReady(true);
  };

  // 파이어베이스 -> 날짜 스트링 처리
  const dateString = (date) => {
    if (date) {
      return (
        date.toDate().toLocaleDateString() +
        " " +
        date.toDate().toLocaleTimeString()
      );
    }
  };

  const userIdSplit = (userId) => {
    if (userId) {
      return userId.split("@")[0];
    }
  };

  return (
    <DetailContainer>
      {isFontReady &&
        (detailItem?.isEdit ? (
          <EditDetail
            detailItem={detailItem}
            currentId={currentId}
            setEdit={setEdit}
            itemId={itemId}
            setDetailItem={setDetailItem}
            userIdSplit={userIdSplit}
            dateString={dateString}
            getData={getData}
          />
        ) : (
          <>
            <ImageContainer>
              <Image
                style={{ flex: 1 }}
                source={{
                  uri: String(detailItem?.img),
                }}
              />
            </ImageContainer>
            <MarginBox />
            <ScrollView>
              <InfoBox>
                <TitleBox>
                  <TitelText> {detailItem?.title} </TitelText>
                </TitleBox>
                <MarginBox />
                <TitleBox>
                  <PriceText>
                    {" "}
                    {detailItem?.price
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                    원{" "}
                  </PriceText>
                </TitleBox>
                <GroupBox>
                  <DateText>{dateString(detailItem?.date)}</DateText>
                  <UserText>{userIdSplit(detailItem?.userId)} </UserText>
                </GroupBox>
                <MarginBox />
              </InfoBox>
              <ContentBox>
                <ContentText> {detailItem?.content} </ContentText>
              </ContentBox>

              {userId === currentId ? (
                <BtnContainer>
                  <CustomBtn
                    btnText="수정"
                    detailItem={detailItem}
                    handler={setEdit}
                    color={MANGO_COLOR}
                  />
                  <CustomBtn
                    btnText="삭제"
                    detailItem={detailItem}
                    handler={deleteBoard}
                    color={APPLEMANGO_COLOR}
                  />
                </BtnContainer>
              ) : (
                <BtnContainer></BtnContainer>
              )}
              <Comments postId={itemId} />
            </ScrollView>
          </>
        ))}
    </DetailContainer>
  );
};

const MarginBox = styled.View`
  margin-top: 10px;
`;

const DetailContainer = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.backgroundColor};
  /* padding: 5%; */
`;

const ImageContainer = styled.View`
  height: 30%;
  width: 100%;
  justify-items: center;
  align-self: center;
`;

const InfoBox = styled.View`
  margin-left: 10px;
  margin-right: 10px;
  padding: 10px;
  /* border-width: 1px; */
`;

const TitleBox = styled.Text`
  justify-content: flex-start;
  margin-bottom: 15px;
  margin-right: 5px;
`;
const TitelText = styled.Text`
  font-family: korail;
  font-size: 40px;
  font-weight: 700;
  color: ${(props) => props.theme.title};
`;

const PriceText = styled.Text`
  font-family: korail;
  font-size: 32px;
  font-weight: 800;
  color: ${(props) => props.theme.title};
`;

const GroupBox = styled.View`
  margin-top: 10px;
  flex-direction: row;
  justify-content: space-between;
`;
const DateText = styled.Text`
  font-family: korail;
  font-size: 16px;
  font-weight: 600;
  margin-left: 7px;
  color: #d1d1d1;
`;

const UserText = styled.Text`
  font-family: korail;
  font-size: 16px;
  font-weight: 600;
  color: #d1d1d1;
`;

const ContentBox = styled.View`
  min-height: 250px;
  width: 93%;
  border: 1px solid #d1d1d15f;
  border-radius: 5px;
  padding: 15px;
  margin: 15px;
`;
const ContentText = styled.Text`
  font-family: korail;
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
  color: ${(props) => props.theme.title};
`;

const BtnContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export default Detail;
