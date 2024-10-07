import {
  View,
  Text,
  StyleSheet,
  Button,
  Pressable,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useState } from "react";
import { ethers } from "ethers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAddress, setPK, setWalletBT } from "../Store/walletBTSlice";
import { useDispatch } from "react-redux";
function Login({ navigation }) {
  const dispatch = useDispatch();
  const [passPhrase, setPassPhrase] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [createAccountState, setCreateAccountState] = useState(false);
  const [login, setLogin] = useState(false);

  const guideLines = [
    "1. Click on generate passphrase",
    "2. Copy the passphrase that you generate. It can be used to\
   login later on or to recover your account",
    "3. Click on Create Account to create Account in our wallet",
    "4. In case if you want different passphrase click on Clear and\
   repeat\from step 1",
    "5. If you already have an account then use the login button ",
  ];

  function generateMnemonic() {
    setIsLoading(true);
    setTimeout(() => {
      const passPhrase = ethers.Wallet.createRandom().mnemonic.phrase;
      setPassPhrase(passPhrase);
      setIsLoading(false);
    }, 500);
  }
  function createHDWallet() {
    // State for account create load
    setCreateAccountState(true);
    const path = `m/44'/60'/0'/0/0`;
    const hdNode = ethers.utils.HDNode.fromMnemonic(passPhrase);
    const myAccount = hdNode.derivePath(path);
    const walletBT = {
      index: 0,
      walletBTAccounts: [
        { name: myAccount.address, key: myAccount.privateKey },
      ],
    };
    setAccountsLocal(walletBT);
    dispatch(setWalletBT(walletBT));
    dispatch(setAddress(myAccount.address));
    dispatch(setPK(myAccount.privateKey));
    setCreateAccountState(false);
    navigation.navigate("SecondaryNavigator");
  }
  async function setAccountsLocal(walletBT) {
    try {
      const accounts = JSON.stringify(walletBT);
      await AsyncStorage.setItem("walletBTAccounts", accounts);
      await AsyncStorage.setItem("walletBTPP", passPhrase);
    } catch (e) {
      alert(e);
    }
  }
  return (
    <View style={styles.rootContainer}>
      {!createAccountState ? (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to walletBT</Text>
            {!login ? (
              <Text style={styles.tagLine}>
                Follow the steps given below to create an account
              </Text>
            ) : null}
          </View>
          {!login ? (
            <View style={styles.body}>
              {guideLines.map((step) => (
                <View key={step} style={styles.guideLinesContainer}>
                  <Text style={styles.guideLinesText}>{step}</Text>
                </View>
              ))}
              <View style={styles.generatePassPhrase}>
                <Pressable onPress={() => generateMnemonic()}>
                  <Text style={styles.buttonText}>generatePassPhrase</Text>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : null}
                </Pressable>
              </View>
              {passPhrase ? (
                <>
                  <View style={styles.passPhraseContainer}>
                    <Text selectable={true} style={styles.mnemonic}>
                      {passPhrase}
                    </Text>
                  </View>
                  <View style={styles.buttonsAction}>
                    <View style={styles.button}>
                      <Button
                        title="Create Account"
                        onPress={() => createHDWallet()}
                      />
                    </View>
                    <View style={styles.button}>
                      <Button title="Clear" onPress={() => setPassPhrase("")} />
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.loginButtonLink}>
                  <Button title="Login" onPress={() => setLogin(true)} />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.loginContainer}>
              <Text style={styles.loginLabel}>Enter Your Passphrase:</Text>
              <TextInput
                placeholder="Enter your passphrase"
                style={styles.loginBox}
                multiline={true}
              />
              <View style={styles.loginButton}>
                <Button
                  title="Wallet Login"
                  onPress={() => navigation.replace("Login")}
                />
              </View>
            </View>
          )}
        </>
      ) : (
        <ActivityIndicator size="large" color="white" />
      )}
    </View>
  );
}
export default Login;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#a4c5e6",
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: "#0a4f95",
    paddingVertical: 20,
  },
  body: {
    marginTop: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  tagLine: {
    color: "white",
  },
  mnemonic: {
    paddingHorizontal: 2,
    paddingVertical: 5,
    fontSize: 16,
  },
  buttonsAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  generatePassPhrase: {
    marginTop: 5,
    marginBottom: 10,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#2196F3",
    borderRadius: 30,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  button: {
    flex: 1,
    marginHorizontal: "5%",
  },
  guideLinesContainer: {
    backgroundColor: "white",
    margin: 5,
    padding: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignSelf: "stretch",
  },
  guideLinesText: {
    color: "red",
    fontSize: 16,
  },
  passPhraseContainer: {
    backgroundColor: "#ffffff",
    elevation: 5,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonLink: {
    marginHorizontal: 20,
    elevation: 5,
  },
  loginBox: {
    backgroundColor: "white",
    alignSelf: "stretch",
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginHorizontal: 20,
  },
  loginButton: {
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  loginLabel: {
    fontSize: 18,
    fontWeight: "bold",
    paddingBottom: 5,
  },
});
