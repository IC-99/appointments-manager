import webview
import os
import sys
import json
from random import randint

class AppointmentManager:
    def __init__(self, data_file='appointments.json'):
        self.data_file = data_file
        self.appointments = self.load_appointments()
        self.current_id = "0"
        self.ids = {}
        for appointment in self.appointments:
            self.ids[appointment["id"]] = True

    def load_appointments(self):
        if os.path.exists(self.data_file):
            with open(self.data_file, 'r') as f:
                return json.load(f)
        return []

    def save_appointments(self):
        with open(self.data_file, 'w') as f:
            json.dump(self.appointments, f, indent=4)
        return True

    def get_appointments(self):
        return self.appointments
    
    def filter_appointments(self, str: str):
        res = []
        str = str.lower()
        for appointment in self.appointments:
            if str in json.dumps(appointment).lower():
                res.append(appointment)
        return res

    def add_appointment(self, appointment):
        id = "0"
        while id in self.ids:
            id = str(randint(0, 1000000000000000))
        appointment["id"] = id
        self.ids[id] = True
        self.appointments.append(appointment)
        self.save_appointments()
        return True

    def update_appointment(self, updated_appointment):
        index = self.get_index(updated_appointment["id"])
        self.appointments[index] = updated_appointment
        self.save_appointments()
        return True

    def delete_appointment(self, id):
        index = self.get_index(id)
        del self.appointments[index]
        self.save_appointments()
        return True
    
    def get_index(self, id: str):
        for i in range(len(self.appointments)):
            if self.appointments[i]["id"] == str(id):
                return i
        return -1

    def open_add_window(self):
        webview.create_window('Aggiungi Appuntamento', f'file://{html_path}/add.html', js_api=self, width=800, height=900)
        return True
    
    def open_calendar(self):
        webview.create_window('Aggiungi Appuntamento', f'file://{html_path}/calendar.html', js_api=self, width=1100, height=800)
        return True

    def open_edit_window(self, id):
        self.current_id = str(id)
        webview.create_window('Modifica Appuntamento', f'file://{html_path}/edit.html', js_api=self, width=800, height=900)
        return True

    def get_appointment(self):
        print(f"è stato richiesto l'appuntamento con id = {self.current_id}")
        index = self.get_index(str(self.current_id))
        print("indice calcolato:", index)
        if 0 <= index < len(self.appointments):
            return json.dumps(self.appointments[index])
        return {}

    def close_window(self):
        webview.active_window().destroy()
        # webview.get_window().close()
        return True

def get_resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

if __name__ == '__main__':
    api = AppointmentManager()
    html_path = get_resource_path("templates")
    webview.create_window("Gestione Appuntamenti", url=f'file://{html_path}/index.html', js_api=api, width=1500, height=800, screen=webview.screens[0])
    print("API is ready:", api)
    webview.start(debug=False)
