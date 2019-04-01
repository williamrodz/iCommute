//
//  CommuteNotification.swift
//  iCommute
//
//  Created by William A. Rodriguez on 3/31/19.
//  Copyright © 2019 GoldenRod. All rights reserved.
//

import Foundation

class CommuteNotification: NSObject{
    var origin:String;
    var destination:String;
    var departureTime:String;
    
    init(origin:String,destination:String,departureTime:String){
        self.origin = origin
        self.destination = destination
        self.departureTime = departureTime
    }
}

