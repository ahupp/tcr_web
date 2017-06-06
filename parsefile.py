"""
This script parses a single file and pushes it to firebase. 
"""

import pandas as pd
import numpy as np
import json
import datetime
import os
from firebase import firebase


def populate_tag(start, df):
    tagInfo = {}

    tagInfo[0] = {}
    tagInfo[0][0] = 'Category'
    tagInfo[0][1] = 'Initial Step'
    tagInfo[0][2] = 'Timeline Date'
    tagInfo[0][3] = 'Goal Achieved?'

    currentIndex = 1
    lastUsedStart = -1
    while(not(start >= df.shape[0] or df.iloc[start, 0] in tags)):

        #Remove '\n' from field 1
        df.iloc[start, 1] = df.iloc[start, 1].replace('\n', ' ')

        #Deal with case where the line has no category (not a new task)
        #and is just a continuing description of the previous line
        if (df.iloc[start, 0] == "" or df.iloc[start, 0] == " ") and not lastUsedStart == -1:
            tagInfo[lastUsedStart][2] = tagInfo[lastUsedStart][2] \
                + str(df.iloc[start, 2])

            tagInfo[lastUsedStart][3] = tagInfo[lastUsedStart][3] \
                + str(df.iloc[start, 1])

        #Create a new task
        else:
            tagInfo[currentIndex] = {}
            tagInfo[currentIndex][0] = df.iloc[start, 0]
            tagInfo[currentIndex][1] = df.iloc[start, 1]
            if isinstance(df.iloc[start, 2], datetime.datetime):
                tagInfo[currentIndex][2] = str(df.iloc[start, 2].month) + \
                    "/" + str(df.iloc[start, 2].day) + "/" + str(df.iloc[start, 2].year)
            else:
                tagInfo[currentIndex][2] = ""
            tagInfo[currentIndex][3] = df.iloc[start, 3]
            lastUsedStart = currentIndex
            currentIndex = currentIndex + 1
        start = start + 1

    return tagInfo

def skip_to_tag(tag, start, df):
    while df.iloc[start, 0] != tag and df.iloc[start, 1] != tag:
        start = start + 1
    return start

def layout():
    layout = {}
    layout[0] = 'Foundations'
    layout[1] = 'Training Goals'
    layout[2] = 'Employment Activity Goals'
    layout[3] = 'Employed Participants'

    return layout

def participant_data_to_json(filename):
    data = {}
    data['layout'] = layout()

    # Read the excel sheet to pandas dataframe --> Insert the name of the desired
    # participant here
    df = pd.read_excel(filename, sheetname=0)
    df = df.dropna(how='all')
    df = df.replace(np.NaN, "")
    if(df.iloc[0,2] != ""):
        data['Participant Name'] = df.iloc[0, 1]
    else:
        data['Participant Name'] = filename

    data['Coach Name'] = df.iloc[1, 1]

    start = skip_to_tag("Foundations", 0, df)
    data['Foundations'] = populate_tag(start + 2, df);

    start = skip_to_tag("Training  Goals", start, df)
    data['Training Goals'] = populate_tag(start + 2, df)

    start = skip_to_tag("Employment Activity Goals", start, df)
    data['Employment Activity Goals'] = populate_tag(start + 2, df)

    start = skip_to_tag("Employed Participants", start, df)
    data['Employed Participants'] = populate_tag(start + 2, df)

    #print json.dumps(data, indent=4, sort_keys=True)

    return data

tags = {"Foundations", "Training  Goals", "Employment Activity Goals", "Employed Participants"}

def upload_new_participant_data(filename):
    new_participant = participant_data_to_json(filename)
    #os.remove(os.path.join(UPLOAD_FOLDER, filename))
    print "removed"
    new_user = {}
    new_user["Participant Name"] = new_participant["Participant Name"]
    new_user["Coach Name"] = new_participant["Coach Name"]

    #add support for authentication 
    firebaseRef = firebase.FirebaseApplication('https://twincitiesrise2.firebaseio.com/', None)
    users = firebaseRef.get('/users', None)
    for key in users:
        if 'Participant Name' in users[key] and users[key]['Participant Name'] == new_participant["Participant Name"]:
            return False

    print "uploading"
    result = firebaseRef.post('/users', new_user)

    firebaseRef.put('/tasks', result['name'], new_participant)
    print "returning"
    return True

def get_participant_key(users, name):
    for key in users:
        if 'Participant Name' in users[key] and users[key]['Participant Name'] == name:
            return key
    return ""


def update_participant_data(filename):
    participant = participant_data_to_json(filename)
    #os.remove(os.path.join(UPLOAD_FOLDER, filename))
    user = {}
    user["Participant Name"] = participant["Participant Name"]
    user["Coach Name"] = participant["Coach Name"]

    #add support for authentication 
    firebaseRef = firebase.FirebaseApplication('https://twincitiesrise2.firebaseio.com/', None)
    users = firebaseRef.get('/users', None)
    
    key = get_participant_key(users, participant["Participant Name"])
    if(key == ""):
        result = firebaseRef.post('/users', user)
        key = result['name']
    else:
        firebaseRef.put('/users', key, user)

    firebaseRef.put('/tasks', key, participant)
    #os.remove(os.path.join(UPLOAD_FOLDER, filename))

