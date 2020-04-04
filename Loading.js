import React from 'react';
import { View, Text,StyleSheet, ActivityIndicator } from 'react-native';
import { firebase } from '@react-native-firebase/database';


export default class Loading extends React.Component {
  componentDidMount() {
      firebase.auth().onAuthStateChanged(user => {
        this.props.navigation.navigate(user ? 'Main' : 'SignUp')
      })
    }

  render() {
    return (
      <View style={styles.container}>
        <Text>Loading</Text>
        <ActivityIndicator size="large" />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textInput: {
    height: 40,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 8
  }
})
