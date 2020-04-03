import React from 'react';
import { View, Text,StyleSheet,Alert,Picker,TextInput,TouchableOpacity, ActivityIndicator } from 'react-native';


export default class AddCommute extends React.Component {
  constructor(props){
    super(props);
    this.state={timePickerVisible:false}

  }

  render (){
    return (
      <View style={{flex:1,backgroundColor:'bisque',alignItems:'center',justifyContent:'center',paddingTop:100}}>
        <Text style={{fontSize:20,paddingBottom:10}}>What's your home address?</Text>
        <GooglePlacesInput processAddressFunction = {from=>this.setState({from:from})}/>
        <Text style={{fontSize:20}}>Where's work?</Text>
        <GooglePlacesInput processAddressFunction = {to=>this.setState({to:to})}/>
        <DateTimePickerModal
          isVisible={this.state.timePickerVisible}
          mode="time"
          onConfirm={(time)=>this.setState({timePickerVisible:false,time:time})}
          onCancel={()=>Alert.alert("canceled")}
        />
        <Button icon={<Icon name="clock-o" size={15} color="white"/>}
        style={{padding:5}} title="Set Time" onPress={()=>this.setState({timePickerVisible:true})}/>

        <Button buttonStyle={{backgroundColor:'green'}}containerStyle={{paddingBottom:40}} titleStyle={{color:"white"}}
        type="clear" title="Submit"
        disabled={!(this.state.from && this.state.to && this.state.time)}
        onPress={()=> submitNewCommuteButton(this.props.navigation,this.props.route,this.state)}/>
        <Button icon={<Icon name="clock-o" size={15} color="white"/>}
        style={{padding:5}} title="Test" onPress={()=>testSubmit(this.props.navigation,this.props.route,this.state)}/>


      </View>
    );
  }

}
