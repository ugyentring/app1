import { useEffect, useState } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  Button,
  Pressable,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ethers } from "ethers";
import truncateEthAddress from "truncate-eth-address";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { setAddress, setPK, setWalletBT } from "../Store/walletBTSlice";

const INFURA_SEPOLIA_API =
  "https://eth-sepolia.g.alchemy.com/v2/Iz07YEvwdbSPxZFn9ZEMeDnD_1ObtQ4f";

function Account() {
  const dispatch = useDispatch();
  const [walletBTAccounts, setWalletBTAccounts] = useState();
  const [walletBTPP, setWalletBTPP] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [currentAccountAddress, setCurrentAccountAddress] = useState();
  const [currentAccountPK, setCurrentAccountPK] = useState();
  const [balance, setBalance] = useState(0.0);
  const [keyStatus, setKeyStatus] = useState(false);
  const [createAccountStatus, setCreateAccountStatus] = useState(false);
  const [modalStatus, setModalStatus] = useState(false);

  function createAccount() {
    setCreateAccountStatus(true);
    setTimeout(() => {
      const index = walletBTAccounts.index + 1;
      const path = `m/44'/60'/0'/0/${index}`;
      const hdNode = ethers.utils.HDNode.fromMnemonic(walletBTPP);
      const myAccount = hdNode.derivePath(path);
      const newWalletBTAccounts = {
        ...walletBTAccounts,
        index: index,
        walletBTAccounts: [
          ...walletBTAccounts.walletBTAccounts,
          { name: myAccount.address, key: myAccount.privateKey },
        ],
      };
      setAccountsLocal(newWalletBTAccounts);
      dispatch(setWalletBT(newWalletBTAccounts));
      setCreateAccountStatus(false);
      Alert.alert(
        "Account Creation",
        `You have successfully created an account with address ${truncateEthAddress(
          myAccount.address
        )}`,
        [{ text: "Ok" }]
      );
    }, 500);
  }

  async function setAccountsLocal(walletBT) {
    try {
      const accounts = JSON.stringify(walletBT);
      await AsyncStorage.setItem("walletBTAccounts", accounts);
    } catch (e) {
      alert(e);
    }
  }

  useEffect(() => {
    const walletAddresses = async () => {
      try {
        const addresses = await AsyncStorage.getItem("walletBTAccounts");
        const passphrase = await AsyncStorage.getItem("walletBTPP");
        const formattedAddresses = JSON.parse(addresses);
        setWalletBTAccounts(formattedAddresses);
        dispatch(setWalletBT(formattedAddresses));
        setWalletBTPP(passphrase);
        setIsLoading(false);
      } catch (error) {
        alert(error);
      }
    };
    walletAddresses();
    if (currentAccountPK) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(
          INFURA_SEPOLIA_API
        );
        const wallet = new ethers.Wallet(currentAccountPK, provider);
        wallet
          .getBalance()
          .then((balance) => {
            setBalance(ethers.utils.formatEther(balance));
          })
          .catch((e) => {
            alert(e);
          });
      } catch (error) {
        alert(error);
      }
    }
  }, [currentAccountAddress, balance]);

  useEffect(() => {
    if (!isLoading) {
      setCurrentAccountAddress(walletBTAccounts.walletBTAccounts[0].name);
      dispatch(setAddress(walletBTAccounts.walletBTAccounts[0].name));
      setCurrentAccountPK(walletBTAccounts.walletBTAccounts[0].key);
      dispatch(setPK(walletBTAccounts.walletBTAccounts[0].key));
    }
  }, [isLoading]);

  useEffect(() => {
    const walletBTAccounts = async () => {
      try {
        const addresses = await AsyncStorage.getItem("walletBTAccounts");
        const formattedAddresses = JSON.parse(addresses);
        setWalletBTAccounts(formattedAddresses);
        dispatch(setWalletBT(formattedAddresses));
      } catch (error) {
        alert(error);
      }
    };
    walletBTAccounts();
  }, [createAccountStatus]);

  return (
    <View style={styles.rootContainer}>
      {isLoading ? (
        <ActivityIndicator size="large" color="white" />
      ) : (
        <View style={styles.bodyContainer}>
          <Modal
            animationType="slide"
            onRequestClose={() => setModalStatus(false)}
            visible={modalStatus}
          >
            <View style={styles.modalContainer}>
              <FlatList
                ListHeaderComponent={() => (
                  <Text style={styles.modalHeader}>List of Your Accounts</Text>
                )}
                ListFooterComponent={() => (
                  <Text style={styles.modalFooter}>
                    Click on account to select it
                  </Text>
                )}
                data={walletBTAccounts.walletBTAccounts}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setCurrentAccountAddress(item.name);
                      setCurrentAccountPK(item.key);
                      setModalStatus(false);
                    }}
                  >
                    <Text style={styles.modalAccountNameLabel}>
                      {item.name}
                    </Text>
                  </Pressable>
                )}
                keyExtractor={(item) => item.name}
              />
            </View>
          </Modal>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Sepolia Test Network</Text>
            <Text style={styles.headerTagLine}>
              Currently you are using the Ethereum test network
            </Text>
          </View>
          <View style={styles.body}>
            <View>
              <Text style={styles.label}>Current Account Address:</Text>
              <Text style={styles.value} selectable={true}>
                {currentAccountAddress}
              </Text>
            </View>
            <View style={styles.prvateKeyContainer}>
              <Text style={styles.label}>
                Click the button below to get your private key
              </Text>
              {!keyStatus ? (
                <Pressable
                  style={styles.getPrivateKey}
                  onPress={() => setKeyStatus(true)}
                >
                  <Text style={styles.getPrivateKeyButton}>getPrivateKey</Text>
                </Pressable>
              ) : (
                <>
                  <Text>{currentAccountPK}</Text>
                  <Button title="Hide" onPress={() => setKeyStatus(false)} />
                </>
              )}
            </View>
            <View style={styles.prvateKeyContainer}>
              <Text style={styles.label}>Create New Account</Text>
              {!createAccountStatus ? (
                <Ionicons
                  style={{ paddingTop: 10 }}
                  name="add-circle-sharp"
                  size={42}
                  color="green"
                  onPress={() => createAccount()}
                />
              ) : (
                <ActivityIndicator size="large" color="white" />
              )}
            </View>
            <View style={styles.prvateKeyContainer}>
              <Text style={styles.label}>Change the Account</Text>
              <Pressable
                onPress={() => setModalStatus(true)}
                style={styles.changeAccountButton}
              >
                <Text style={{ paddingTop: 5 }}>
                  {currentAccountAddress
                    ? truncateEthAddress(currentAccountAddress)
                    : null}
                </Text>
                <Ionicons
                  name="ios-chevron-down-circle-sharp"
                  size={32}
                  color="white"
                />
              </Pressable>
            </View>
            <View style={styles.footer}>
              {balance ? (
                <>
                  <Text style={styles.balanceLabel}>Balance</Text>
                  <Text style={styles.balance}>
                    {parseFloat(balance).toFixed(5)}
                  </Text>
                </>
              ) : (
                <>
                  <ActivityIndicator size="large" color="white" />
                  <Text style={styles.footerBalanceLoadingText}>
                    Loading the balance
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

export default Account;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    backgroundColor: "#0a4f95",
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    paddingVertical: 20,
  },
  headerTagLine: {
    color: "white",
    fontSize: 17,
  },
  body: {
    flex: 1,
    justifyContent: "space-between",
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    paddingVertical: 10,
    paddingLeft: 20,
  },
  value: {
    fontSize: 15,
    fontWeight: "bold",
    paddingVertical: 5,
    paddingLeft: 20,
  },
  bodyContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  footer: {
    backgroundColor: "#31689f",
    paddingVertical: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  footerBalanceLoadingText: {
    color: "white",
    fontSize: 16,
  },
  prvateKeyContainer: {
    alignItems: "center",
    paddingLeft: 5,
    paddingRight: 10,
  },
  balance: {
    color: "white",
    fontSize: 24,
    textAlign: "center",
    fontWeight: "bold",
  },
  balanceLabel: {
    fontSize: 16,
    color: "white",
  },
  getPrivateKey: {
    borderRadius: 20,
    backgroundColor: "green",
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "center",
  },
  getPrivateKeyButton: {
    color: "white",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#a4c5e6",
    justifyContent: "center",
    alignItems: "center",
  },
  changeAccountButton: {
    backgroundColor: "green",
    flexDirection: "row",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  modalAccountNameLabel: {
    marginVertical: 5,
    backgroundColor: "#0a4f95",
    color: "white",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomRightRadius: 20,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    paddingVertical: 20,
    alignSelf: "center",
  },
  modalFooter: {
    color: "red",
    marginTop: 10,
    fontSize: 16,
    backgroundColor: "#dfe8f0",
    paddingVertical: 20,
    textAlign: "center",
  },
});
