/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log('*** device ready')

        listenGCMNotifications();
    }
};

function listenGCMNotifications () {
    var pushNotification = window.plugins.pushNotification;

    pushNotification.register(
        successHandler,
        errorHandler, {
            "senderID":"193156067209", // This is the Google project ID you need to obtain by registering your application for GCM
            "ecb":"onNotificationGCM"
        }
    );

    console.log('*** Listening to pushNotifications ...')
}
function successHandler (result) {
    console.log('*** successHandler = ' + result);

    // Exposes onNotificationGCM callback
    window.onNotificationGCM = onNotificationGCM;
}
function errorHandler (error) {
    console.log('*** errorHandler = ' + error);
}

function onNotificationGCM (e) {
    console.log('*** onNotificationGCM = ' + e.event);

    var $status = $("#app-status");
    var $entry = $('<div></div>');

    switch (e.event) {
        case 'registered':
            if (e.regid.length > 0) {
                //your GCM push server needs to know the regID before it can push to this device
                //you can store the regID for later use here
                $entry.text('regID received = ' + e.regid);
            }
            break;
        case 'message':

            $entry.text( 'message = ' + JSON.stringify(e, null, 2) );

            break;
        case 'error':
            $entry.text('error = ' + e.msg);
            break;
        default:
            $entry.text('An unknown GCM event has occurred.' + JSON.stringify(e, null, 2));
            break;
    }

    $status.append($entry)

}