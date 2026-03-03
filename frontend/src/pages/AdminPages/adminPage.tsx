import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, Button, Paper, Title, Container, Group, Alert, Text, Divider, Flex } from '@mantine/core';
import { useForm } from '@mantine/form';
// import LogoSVG from "../../../icons/logo2.svg?react";
import { Cookies } from 'react-cookie-consent';
import styles from './adminPage.module.css';
import { adminAddress, fetchAddress } from '../../globalSettings';
// import AuthService from '../../../services/authService';

export function AdminPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.background}>
      <Container size={420} className={styles.container}>
        <div className={styles.logoContainer}>
          {/* <LogoSVG className={styles.logo} /> */}
        </div>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md" className={styles.paper}>
          <Title order={2} ta="center" mb="md">
            Админ панель
          </Title>

          <Flex gap={'20px'} justify="center"> 
            <Button onClick={() => window.location.href = adminAddress + 'admin/'}>Админ</Button>
            <Button onClick={() => navigate('/admPanel/table')}>Заполнение описи</Button>
          </Flex>

        </Paper>
      </Container>
    </div>
  );
}