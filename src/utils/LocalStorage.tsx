import AsyncStorage from "@react-native-async-storage/async-storage";


const storeData = async (props:any) => {
    try {
        await AsyncStorage.setItem(props.key, props.value)
    } catch (e) {

    }
}

const getData = async (props:any) => {
    try {
        const value = await AsyncStorage.getItem(props.key)
        if (value !== null) {
            return value;
        }
    } catch (e) {

    }
}


export {
    storeData,
    getData
};
