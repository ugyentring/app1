import "react-native-get-random-values";
import "@ethersproject/shims";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, SafeAreaView, StatusBar as SB } from "reactnative";
import { NavigationContainer } from "@react-navigation/native";
import MainNavigator from "./Navigators/MainNavigator";
import { Provider } from "react-redux";
import { store } from "./Store/store";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Provider store={store}>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </Provider>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SB.currentHeight,
    backgroundColor: "#0a4f95",
  },
});
