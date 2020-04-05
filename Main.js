import React, {useState, useEffect} from 'react';
import { View, Text,StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

import { ListItem, Button } from 'react-native-elements'
import { notifications } from "react-native-firebase-push-notifications"



async function getCommuteDataFromKey(key){
  const masterCommutesRef = database().ref(`/masterCommutes/${key}`);
  const snapshotCommute = await masterCommutesRef.once('value');
  return snapshotCommute.val();

}

async function getCommutes() {
  // Get the users ID
  const uid = auth().currentUser.uid;
  console.log(`Loading user ${uid}'s commutes`)

  // Create a reference
  const ref = database().ref(`/users/${uid}/commutes`);

  // Fetch the data snapshot
  const snapshot = await ref.once('value');
  const snapShotCommuteIDsObj = snapshot.val();

  var commutes = []
  if (snapShotCommuteIDsObj){
    const snapShotCommuteIDs = Object.keys(snapShotCommuteIDsObj)
    snapShotCommuteIDs.forEach( async (key, i) => {
      commutes.push(getCommuteDataFromKey(key))
    });
  }
  return Promise.all(commutes);
}

async function deleteCommuteWithID(timestamp,viewRefreshFunction){
  getCommuteDataFromKey(timestamp).then(commuteData=>{
    const hour = commuteData.hour
    const minute = commuteData.minute
    const userID = commuteData.userID

    const userRef = database().ref(`/users/${userID}/commutes/${timestamp}`);
    var removedFromUser = userRef.remove()

    const scheduledRef = database().ref(`/scheduled/${hour}/${minute}/${timestamp}`);
    var removedFromScheduled = scheduledRef.remove()

    const masterRef = database().ref(`/masterCommutes/${timestamp}`);
    var removedFromMaster = masterRef.remove()

    return Promise.all([removedFromUser,removedFromScheduled,removedFromMaster])
    .then(data=>viewRefreshFunction(timestamp))
    .catch(error=>Alert.alert(`Deletion failed ${error}`))

  })

}

async function deleteAllCommutes(viewRefreshFunction){
  const uid = auth().currentUser.uid;

  const ref = database().ref(`/users/${uid}/commutes`);
  ref.remove()
  .then((data)=>{
    Alert.alert("Succesfully deleted commutes")
    viewRefreshFunction();
    })
  .catch(error=>"Error deleting:"+error);

}


async function getDistance(start,end){

  var requestUrl = "https://us-central1-icommute-firebase.cloudfunctions.net/getDistance?";
  requestUrl+=`from=${start}&to=${end}`

  return fetch(requestUrl,{method:'POST'})
  .then((response) => {
    return response.json();

    })
  .then( (responseJson) => {
    return responseJson;
    })
}

async function getDistanceButton(){
  transitInfo = await getDistance("428 Memorial, Dr, Cambridge,MA","77 Massachusetts Ave,Cambridge, MA");
  Alert.alert(
    'Distance Calculated',
    'Distance: '+transitInfo.distanceText+'\nTime: '+transitInfo.durationText
    )

}

export default class Main extends React.Component {
  state = { currentUser: null }


  constructor(props){
    super(props);

    this.state = {commutes:false,listItems:[]}

  }

  getToken = async () => {
    //get the messeging token
    const token = await notifications.getToken()
    //you can also call messages.getToken() (does the same thing)
    console.log("Push Token is\n"+token);
    // Alert.alert("Token",token);
    return token
  }
  getInitialNotification = async () => {
    //get the initial token (triggered when app opens from a closed state)
    const notification = await notifications.getInitialNotification()
    return notification
  }

  onNotificationOpenedListener = () => {
    //remember to remove the listener on un mount
    //this gets triggered when the application is in the background
    this.removeOnNotificationOpened = notifications.onNotificationOpened(
      notification => {
        console.log("onNotificationOpened", notification)
        //do something with the notification
      }
    )
  }

  onNotificationListener = () => {
    //remember to remove the listener on un mount
    //this gets triggered when the application is in the forground/runnning
    //for android make sure you manifest is setup - else this wont work
    //Android will not have any info set on the notification properties (title, subtitle, etc..), but _data will still contain information
    this.removeOnNotification = notifications.onNotification(notification => {
      //do something with the notification
      console.log("onNotification", notification)
    })
  }

  onTokenRefreshListener = () => {
    //remember to remove the listener on un mount
    //this gets triggered when a new token is generated for the user
    this.removeonTokenRefresh = messages.onTokenRefresh(token => {
      //do something with the new token
    })
  }
  setBadge = async number => {
    //only works on iOS for now
    return await notifications.setBadge(number)
  }

  getBadge = async () => {
    //only works on iOS for now
    return await notifications.getBadge()
  }

  hasPermission = async () => {
    //only works on iOS
    return await notifications.hasPermission()
    //or     return await messages.hasPermission()
  }

  requestPermission = async () => {
    //only works on iOS
    var obtainedPermission = await notifications.requestPermission()
    return this.registerPushIDToFB()
  }

  onTestHasPermission = async () => {
  const has = await this.hasPermission()
  console.log("Has", has)
  this.setState({ hasPermission: has })
}

handleLogout = () => {
  auth()
    .signOut()
    .then(() => {
      console.log('User signed out!')
      this.props.navigation.navigate('Login'); //<- not working
      // this.props.navigation.goBack();
    });
}

  registerPushIDToFB = async () => {
  const uid = auth().currentUser.uid;
  const pushID = await this.getToken()
  // Create a reference
  const ref = database().ref(`/users/${uid}`);

  await ref.set({
    pushID: pushID,
  });

}

  removeListItemByKey = (key) => {
    var newListItems = []
    for (var i = 0; i < this.state.listItems.length; i++) {
      console.log(this.state.listItems[i].props)
      if (this.state.listItems[i].props.timestamp != key) {
        newListItems.push(this.state.listItems[i])

      } else{
        console.log("not adding item at i="+i)
      }
    }
    this.setState({listItems:newListItems})
  }

  async updateListItems(){
    const userCommutes = await getCommutes();
    console.log(`Loaded commutes are ${userCommutes}`)
    this.setState({commutes:userCommutes});
    if (this.state.commutes){
      var newList = [];
      this.state.commutes.forEach((item, i) => {
        newList.push(<ListItem key={item.timestamp} timestamp={item.timestamp} title={item.from +' to '+item.to} onPress={()=>deleteCommuteWithID(item.timestamp,this.removeListItemByKey)} bottomDivider/>)
      });
      this.setState({listItems:newList});
    }

  }


  async componentDidMount(){

    this.updateListItems()
    this.onNotificationListener()
    this.onNotificationOpenedListener()
    this.getInitialNotification()

  }

  componentWillUnmount() {
    //remove the listener on unmount
    if (this.removeOnNotificationOpened) {
      this.removeOnNotificationOpened()
    }
    if (this.removeOnNotification) {
      this.removeOnNotification()
    }

    if (this.removeonTokenRefresh) {
      this.removeonTokenRefresh()
    }
  }

  render(){
    const { currentUser } = this.state

    return (
      <View style={{flex:1,alignItems:'stretch',...StyleSheet.absoluteFillObject}}>
        <View style={{flex:1,alignItems:'center',backgroundColor:'green',paddingTop:40}}>
          <View >
            <Text style={{fontSize:30}}>{currentUser && currentUser.email} Commutes</Text>
            <Button title="Add Commute"
              onPress = {() => {
                this.props.navigation.navigate('AddCommute',{refreshCommutes:()=>this.componentDidMount()});
              }}
              style={{paddingTop:10,paddingBottom:10}} icon={<Icon name="plus" size={15} color="white"/>}/>
          </View>
          <View style={{width:"100%",backgroundColor:'white'}}>{this.state.listItems}</View>
          <Button title="Delete all" onPress={()=>deleteAllCommutes(this.componentDidMount)}/>
          <Button title="Request Permissions" onPress={this.requestPermission}/>
          <Button title="Has permission" onPress={this.onTestHasPermission}/>

          <Button title="Get Token" onPress={this.getToken}/>
          <Button title="getInitialNotification" onPress={this.getInitialNotification}/>
          <Button title="Logout" onPress={this.handleLogout}/>




        </View>
      </View>
    );

  }
}
