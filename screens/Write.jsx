import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Button,
} from "react-native";
import styled from "@emotion/native";
import { useEffect, useRef, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { dbService } from "../firebase";
import { authService, storage } from "../firebase";
import * as ImagePicker from "expo-image-picker";
import * as Font from "expo-font";
import { APPLEMANGO_COLOR, MANGO_COLOR } from "../colors";
import { SCREEN_WIDTH } from "../util";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const Write = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const currentId = authService.currentUser.email;

  // 스타일링 state
  const [isFontReady, setIsFontReady] = useState(false);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isPriceFocused, setIsPriceFocused] = useState(false);
  const [isContentFocused, setIsContentFocused] = useState(false);

  useEffect(() => {
    fontLoad();
  }, []);

  const titleRef = useRef(null);
  const priceRef = useRef(null);
  const contentRef = useRef(null);

  const validateInput = () => {
    if (!image) {
      Alert.alert("상품 이미지를 등록해주세요.");
      return true;
    }
    if (!title) {
      Alert.alert("상품 이름을 입력해주세요.");
      titleRef.current.focus();
      return true;
    }
    if (!price) {
      Alert.alert("상품 가격을 입력해주세요.");
      priceRef.current.focus();
      return true;
    }
    if (!content) {
      Alert.alert("상품 설명을 입력해주세요.");
      contentRef.current.focus();
      return true;
    }
  };

  const uploadImage = async () => {
    validateInput();

    const blobImage = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new TypeError("네트워크 요청 실패"));
      };
      xhr.responseType = "blob";
      xhr.open("get", image, true);
      xhr.send(null);
    });

    const metadata = {
      contentType: "image/jpeg",
    };
    const storageRef = ref(storage, "Categories/" + Date.now());
    const uploadTask = uploadBytesResumable(storageRef, blobImage, metadata);

    uploadTask.on("state_changed", () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        setImage("null");
        const newBoard = createNewBoard(downloadURL);
        addBoard(newBoard);
        // setTimeout(() => {
        //   const newBoard = createNewBoard(downloadURL);
        //   addBoard(newBoard);
        // }, 2000);
      });
    });
  };
  const createNewBoard = (img) => ({
    userId: currentId,
    title,
    content,
    price,
    date: new Date(),
    isDone: false,
    isEdit: false,
    img,
  });

  const addBoard = async (newBoard) => {
    await addDoc(collection(dbService, "posts"), newBoard);
    setContent("");
    setTitle("");
    setPrice("");
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 폰트 비동기 처리

  const fontLoad = async () => {
    await Font.loadAsync({
      korail: require("../assets/fonts/Korail_Round_Gothic_Bold.ttf"),
    });
    setIsFontReady(true);
  };

  return (
    <DetailContainer>
      {isFontReady && (
        <>
          {image && (
            <ImgContainer
              source={{
                uri: image,
              }}
            />
          )}
          <Button title="사진 추가" onPress={pickImage} />

          <BtnContainer>
            <TouchableOpacity
              onPress={() => {
                uploadImage();
              }}
              style={{ margin: 10 }}
            >
              <ButtonView>
                <BtnText> 글쓰기 </BtnText>
              </ButtonView>
            </TouchableOpacity>
          </BtnContainer>
          <InfoBox>
            <View>
              <InputBox
                value={title}
                onChangeText={setTitle}
                placeholder="상품 이름을 입력해주세요."
                ref={titleRef}
                onBlur={() => {
                  setIsTitleFocused(false);
                }}
                onFocus={() => {
                  setIsTitleFocused(true);
                }}
                isTitleFocused={isTitleFocused}
              />
            </View>
            <View style={{ marginTop: 20 }}>
              <InputBox
                keyboardType="number-pad"
                value={price}
                onChangeText={setPrice}
                placeholder="상품 가격을 입력해주세요."
                ref={priceRef}
                onBlur={() => {
                  setIsPriceFocused(false);
                }}
                onFocus={() => {
                  setIsPriceFocused(true);
                }}
                isPriceFocused={isPriceFocused}
              />
            </View>
          </InfoBox>
          <ContentBox isContentFocused={isContentFocused}>
            <InputContent
              style={{ textAlignVertical: "top" }}
              multiline={true}
              onChangeText={setContent}
              value={content}
              placeholder="상품 설명을 입력해주세요."
              ref={contentRef}
              onBlur={() => {
                setIsContentFocused(false);
              }}
              onFocus={() => {
                setIsContentFocused(true);
              }}
            />
          </ContentBox>
        </>
      )}
    </DetailContainer>
  );
};

export default Write;

const DetailContainer = styled.ScrollView`
  flex: 1;
  background-color: ${(props) => props.theme.backgroundColor};
`;

const ImgContainer = styled.Image`
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

const InputBox = styled.TextInput`
  height: 40px;
  width: 100%;
  border-bottom-width: 3px;
  border-color: ${(props) => {
    if (props.isPriceFocused || props.isTitleFocused) {
      return MANGO_COLOR;
    } else {
      return "#d1d1d1";
    }
  }};
  padding: 10px;
  color: ${(props) => props.theme.title};
`;

const ContentBox = styled.View`
  height: 300px;
  width: 93%;
  border: 1px solid #d1d1d15f;
  border-radius: 5px;
  padding: 15px;
  margin: 15px;
  border-color: ${(props) => {
    if (props.isContentFocused) {
      return MANGO_COLOR;
    } else {
      return "#d1d1d1";
    }
  }};
  
`;

const InputContent = styled.TextInput`
  height: 150px;
  width: 100%;
  padding-left: 0;
  padding-top: 0;
  padding: 10px;
  color: ${(props) => props.theme.title};
`;

const BtnContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;

const ButtonView = styled.View`
  background-color: ${MANGO_COLOR};
  border-radius: 10px;
  margin-right: 10px;
  padding: 13px;
  width: ${SCREEN_WIDTH / 5 + "px"};
`;

const BtnText = styled.Text`
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.btn};
`;
