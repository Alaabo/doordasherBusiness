import {Text, View} from 'react-native';
import {RequestType} from "@/types/globals";
interface IProps {
    orders: RequestType[]
}
const OrderComponent = (orders : IProps) => {
    return (
        <>
            hello
        </>
    )
}

export default OrderComponent;
