import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screen/Login";
import SecondaryNavigator from "./SecondaryNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const Stack = createNativeStackNavigator();

function MainNavigator() {
  const [passphraseStatus, setPassphraseStatus] = useState();

  useEffect(() => {
    const passPhrase = async () => {
      const pp = await AsyncStorage.getItem("walletBTPP");
      setPassphraseStatus(pp);
    };
    passPhrase();
  }, [passphraseStatus]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {passphraseStatus ? (
        <Stack.Screen
          name="SecondaryNavigator"
          component={SecondaryNavigator}
        />
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen
            name="SecondaryNavigator"
            component={SecondaryNavigator}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
export default MainNavigator;
