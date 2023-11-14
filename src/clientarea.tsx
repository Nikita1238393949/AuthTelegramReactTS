import React from 'react';
import {Form, Card, notification, Typography} from 'antd';
import TelegramLoginButton, {TelegramUser} from './TelegramLogin'
import {useLocation} from "react-router-dom";

const server_address: string = 'http://localhost:8000'
const LinkTelegramAccount = async (token: string, user: TelegramUser) => {
    const telegramId = user.id;
    try {
        const response = await fetch(server_address + '/api/link_telegram/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
                //доступно только авторизованным с передачей токена в заголовке
            },
            body: JSON.stringify({telegram_id: telegramId}),
        });
        if (!response.ok) {
            throw new Error();
        }
        notification.success({
            message: 'Аккаунт Telegram успешно связан',
        });
    } catch (error) {
        notification.error({
            message: 'Ошибка связывания аккаунта',
            description: 'Не удалось связать аккаунт Telegram'
        });
    }
};
const ClientArea: React.FC = () => {
    const {Text} = Typography;
    const location = useLocation();
    const tokenData = location.state.token;
    // cбор токена который я передал через роутер на LoginForm
    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <Card style={{width: 380}}>
                <Text>{`Осуществите привязку по кнопке ниже`}</Text>
                <Form
                    name="clientarea"
                    layout="vertical"
                >
                    <div>
                        <TelegramLoginButton dataOnAuth={(user) => LinkTelegramAccount(tokenData, user)}
                                             botName="lmsitmobot"/>
                    </div>
                </Form>
            </Card>
        </div>
    )
};

export default ClientArea;