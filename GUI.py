from tkinter import *
from tkinter import font
from tkinter.ttk import *
from tkinter.filedialog import askopenfile 
import time

root = Tk()
root.title('CGPA Prediction')
root.geometry('400x400')
root_font = font.Font(family="Lucida Grande", size=20)

DATA_FILE = ''


def open_file():
    file_path = askopenfile(mode='r', filetypes=[('Spreadsheet files', '*.xlsx')])
    time.sleep(2)
    uploadFiles()
    return file_path

def uploadFiles():
    pb1 = Progressbar(
        root, 
        orient=HORIZONTAL, 
        length=300, 
        mode='determinate'
        )
    pb1.grid(row=4, columnspan=3, pady=20)
    for i in range(5):
        root.update_idletasks()
        pb1['value'] += 20
        time.sleep(1)
    pb1.destroy()
    upload = Label(root, text='File Uploaded Successfully!', foreground='green')
    upload.grid(row=4, columnspan=3, pady=10)
    time.sleep(2)
    upload.destroy()



def setup_title():
    global title
    title = Label(
        root,
        text = "CGPA Prediction",
        font = root_font
    )
    title.grid(row = 0, column = 0)


def setup_description():
    global description
    description = Label(
        root,
        text = "To begin prediction process, upload a dataset and select columns to use."
    )
    description.grid(row = 1, column = 0)
    
def setup_file_upload():
    global upload_label, upload_btn
    upload_label = Label(
        root,
        text = "Click button to upload dataset"
    )
    upload_label.grid(row = 2, column = 0)
    
    upload_btn = Button(
        root,
        text = "Upload dataset",
        command = lambda: open_file()
    )
    upload_btn.grid(row = 2, column = 1)

def setup_destroy_button():
    global destroy_label, destroy_btn
    destroy_btn = Button(
        root,
        text = 'Train model',
        command = lambda: destroy_initial_screen()
    )
    destroy_btn.grid(
        row = 2,
        column = 3
    )

def initialize_screen():
    setup_title()
    setup_description()
    setup_file_upload()
    setup_destroy_button()

def destroy_initial_screen():
    title.destroy()
    description.destroy()
    upload_btn.destroy()
    upload_label.destroy()
    training = Label(root, text='Training model...', foreground='yellow')
    training.grid(row=3, columnspan=3, pady=10)
    time.sleep(3)
    training.destroy()
    done = Label(root, text='Model Trained, proceed to predict', foreground='green')
    done.grid(row=3, columnspan=3, pady=10)



def destroy_screen(*screens):
    for screen in screens:
        map(lambda widget: widget.destroy(), screen)
    


# adhar = Label(
#     root, 
#     text='Upload Government id in jpg format '
#     )
# adhar.grid(row=0, column=0, padx=10)

# adharbtn = Button(
#     root, 
#     text ='Choose File', 
#     command = lambda:open_file()
#     ) 
# adharbtn.grid(row=0, column=1)

# dl = Label(
#     root, 
#     text='Upload Driving License in jpg format '
#     )
# dl.grid(row=1, column=0, padx=10)

# dlbtn = Button(
#     root, 
#     text ='Choose File ', 
#     command = lambda:open_file()
#     ) 
# dlbtn.grid(row=1, column=1)

# ms = Label(
#     root, 
#     text='Upload Marksheet in jpg format '
#     )
# ms.grid(row=2, column=0, padx=10)

# msbtn = Button(
#     root, 
#     text ='Choose File', 
#     command = lambda:open_file()
#     ) 
# msbtn.grid(row=2, column=1)

# upld = Button(
#     root, 
#     text='Upload Files', 
#     command=uploadFiles
#     )
# upld.grid(row=3, columnspan=3, pady=10)


if __name__ == '__main__':
    welcome = initialize_screen()
    # root.grid_columnconfigure(0, weight=1)
    # time.sleep(10)
    # destroy_screen(welcome)
    root.mainloop()