import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { authService, dbService } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import styled from "@emotion/native";
import { MANGO_COLOR } from "../colors";

function Comments({ postId }) {
  const [text, setText] = useState("");
  const [comments, setComments] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editText, setEditText] = useState("");

  // style state
  const [isTextFocused, setIsTextFocused] = useState(false);
  const [isEditFocused, setIsEditFocused] = useState(false);

  const addComments = async () => {
    if (!text) {
      Alert.alert("댓글을 입력해주세요");
      return;
    }
    const newComments = {
      comment: text,
      date: Date.now(),
      isEdit: false,
      postId,
      userId: authService.currentUser.uid,
      createdAt: Date.now(),
    };
    await addDoc(collection(dbService, "comments"), newComments);
    setText("");
    onRefresh();
  };

  const getComments = () => {
    const q = query(
      collection(dbService, "comments"),
      orderBy("date"),
      where("postId", "==", postId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(newComments);
    });
    return unsubscribe;
  };

  const deleteComments = (id) => {
    Alert.alert("댓글 삭제", "정말 삭제하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(dbService, "comments", id));
        },
      },
    ]);
  };

  const setEdit = async (id) => {
    const idx = comments.findIndex((comment) => comment.id === id);
    await updateDoc(doc(dbService, "comments", id), {
      isEdit: !comments[idx].isEdit,
    });
  };

  const editComment = async (id) => {
    await updateDoc(doc(dbService, "comments", id), {
      comment: editText,
      isEdit: false,
    });
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await getComments();
    setIsRefreshing(false);
  };

  useEffect(() => {
    getComments();
  }, []);

  return (
    <CommentContainer>
      <CommentHeader>댓글</CommentHeader>

      <CommentInputBox>
        <CommentInput
          onBlur={() => {
            setIsTextFocused(false);
          }}
          onFocus={() => setIsTextFocused(true)}
          isTextFocused={isTextFocused}
          value={text}
          onChangeText={setText}
        />
        <CommentBtn onPress={addComments}>
          <BtnText>등록</BtnText>
        </CommentBtn>
      </CommentInputBox>

      <CommentList>
        {comments.map((item) => {
          return (
            <CommentItem
              key={item.id}
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {item.isEdit ? (
                <CommentEditInput
                  onBlur={() => {
                    setIsEditFocused(false);
                  }}
                  onFocus={() => setIsEditFocused(true)}
                  isTextFocused={isEditFocused}
                  onChangeText={setEditText}
                  onSubmitEditing={() => editComment(item.id)}
                  defaultValue={item.comment}
                />
              ) : (
                <CommentText>{item.comment}</CommentText>
              )}

              {authService.currentUser.uid === item.userId ? (
                <View
                  style={{
                    flexDirection: "row",
                  }}
                >
                  <TouchableOpacity onPress={() => setEdit(item.id)}>
                    <Feather
                      style={{ marginLeft: 10 }}
                      name="edit"
                      size={20}
                      color="#c0c0c0"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteComments(item.id)}>
                    <AntDesign
                      style={{ marginLeft: 10 }}
                      name="delete"
                      size={20}
                      color="#c0c0c0"
                    />
                  </TouchableOpacity>
                </View>
              ) : null}
            </CommentItem>
          );
        })}
      </CommentList>
    </CommentContainer>
  );
}

const CommentContainer = styled.View`
  width: 95%;
  //border: 1px solid black;
  padding: 10px 15px;
  margin-left: 10px;
  margin-bottom: 10px;
  margin-top: 20px;
`;

const CommentHeader = styled.Text`
  font-size: 20px;
  color: ${(props) => props.theme.title};
`;

const CommentInputBox = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const CommentInput = styled.TextInput`
  height: 40px;
  width: 80%;
  border-bottom-width: 3px;
  border-color: ${(props) => {
    if (props.isTextFocused) {
      return MANGO_COLOR;
    } else {
      return "#d1d1d1";
    }
  }};
  padding: 10px;
  color: ${(props) => props.theme.title};
`;

const CommentBtn = styled.TouchableOpacity`
  background-color: ${MANGO_COLOR};
  width: 40px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;

const BtnText = styled.Text`
  color: ${(props) => props.theme.btn};
`;

const CommentList = styled.View``;

const CommentItem = styled.View`
  margin: 7px;
  background-color: #d1d1d11b;
  padding: 15px;
  border-radius: 5px;
`;

const CommentEditInput = styled.TextInput`
  height: 34px;
  width: 80%;
  border-bottom-width: 3px;
  border-color: ${(props) => {
    if (props.isEditFocused) {
      return MANGO_COLOR;
    } else {
      return "#d1d1d1";
    }
  }};
  padding: 10px;
  color: ${(props) => props.theme.title};
`;

const CommentText = styled.Text`
  color: ${(props) => props.theme.title};
`;

export default Comments;
