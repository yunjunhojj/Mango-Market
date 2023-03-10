import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { signOut } from "firebase/auth";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { authService } from "../firebase";
import Detail from "../screens/Detail";
import Login from "../screens/Login";
import styled from "@emotion/native";

const NativeStack = createNativeStackNavigator();

export default function Stacks({
  navigation: { navigate, goBack, setOptions, reset },
}) {
  const handleAuth = () => {
    if (authService.currentUser?.uid) {
      // logout 요청
      signOut(authService)
        .then(() => {
          setOptions({ headerRight: null });
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
        })
        .catch((error) => console.log("error: ", error));
    }
  };

  return (
    <NativeStack.Navigator
      screenOptions={{
        headerTitleAlign: "center",
        headerLeft: () => {
          if (authService.currentUser) {
            return (
              <TouchableOpacity onPress={() => goBack()}>
                <BtnText>뒤로</BtnText>
              </TouchableOpacity>
            );
          }
        },
        headerRight: () => {
          return (
            <TouchableOpacity onPress={handleAuth}>
              <BtnText>
                {authService.currentUser ? "로그아웃" : "로그인"}
              </BtnText>
            </TouchableOpacity>
          );
        },
      }}
    >
      <NativeStack.Screen
        options={{ headerShown: false }}
        name="Login"
        component={Login}
      />
      <NativeStack.Screen name="Detail" component={Detail} />
    </NativeStack.Navigator>
  );
}

const BtnText = styled.Text`
  color: ${(props) => props.theme.title};
`;
