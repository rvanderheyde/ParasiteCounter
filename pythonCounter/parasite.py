from Tkinter import *
from PIL import Image, ImageTk
from matplotlib import pyplot as plt
import tkFileDialog
import cv2
import numpy as np
import math
# import gspread
import csv
from oauth2client.client import SignedJwtAssertionCredentials

class App(object):
    def __init__(self, root=None):
        if not root:
            root = Tk()
        self.root = root
        self.initUI()
        self.circles = []
        self.colors = []
        self.checked = []

    def initUI(self):
        self.root.title("Parasite Counter")
        menubar = Menu(self.root)
        self.root.config(menu=menubar)
        fileMenu = Menu(menubar, tearoff=0)
        fileMenu.add_command(label="Open File", command=self.fileOpen)
        # fileMenu.add_command(label="Exit", command=self.onExit)
        menubar.add_cascade(label="File", menu=fileMenu)

        fileMenu2 = Menu(menubar, tearoff=0)
        fileMenu2.add_command(label="Run", command=self.count)
        fileMenu2.add_command(label="Edit Cells", command=self.edit_cells)
        fileMenu2.add_command(label="Edit Parasites", command=self.edit_parasites)
        fileMenu2.add_command(label="Export",command=self.export)
        menubar.add_cascade(label="Image", menu=fileMenu2)
        self.canvas = Canvas(self.root)
        self.canvas.pack(side=LEFT, fill=BOTH)
        self.scrollbar_vert = Scrollbar(self.root)
        self.scrollbar_vert.pack(side=RIGHT, fill=Y)
        self.scrollbar_hor = Scrollbar(self.root)
        self.scrollbar_hor.config(orient=HORIZONTAL)
        self.scrollbar_hor.pack(side=BOTTOM, fill=X)

    def onExit(self):
        self.root.quit()

    def fileOpen(self):
        self.filename = tkFileDialog.askopenfilename(
                parent=self.root,
                title='Choose a file',
                filetypes=[ ( "Image files",("*.jpg", "*.jpeg", "*.png", "*.gif") ), ("All files", ("*.*"))] )

        if self.filename == None:
            return
        self.img = Image.open(self.filename)
        w, h = self.root.winfo_screenwidth(), self.root.winfo_screenheight()
        self.img = self.img.resize((w,h))
        self.photo_image = ImageTk.PhotoImage(self.img)
        self.canvas.pack_forget()
        self.canvas = Canvas(self.root, width=self.img.size[0], height=self.img.size[1])
        self.canvas.create_image(10, 10, anchor=NW, image=self.photo_image)
        self.canvas.pack(side=LEFT, fill=BOTH)
        self.canvas.config(yscrollcommand=self.scrollbar_vert.set)
        self.canvas.config(xscrollcommand=self.scrollbar_hor.set)
        self.canvas.config(scrollregion=self.canvas.bbox(ALL))
        self.scrollbar_vert.config(command=self.canvas.yview)
        self.scrollbar_hor.config(command=self.canvas.xview)

    def run(self):
        self.root.mainloop()

    def count(self):
        imgTemp = cv2.imread(self.filename)
        w, h = self.root.winfo_screenwidth(), self.root.winfo_screenheight()
        img = cv2.resize(imgTemp, (w,h), interpolation=cv2.INTER_AREA)
        gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)

        def get_contours(gray):
            ret,thresh = cv2.threshold(gray,127,255,cv2.THRESH_BINARY | cv2.THRESH_OTSU)
            contours, hierarchy = cv2.findContours(thresh,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)
            return contours,thresh

        def check_circles(center,radius,circles,img):
            for cir in circles:
                if circles == []:
                    break
                cc = cir[0]
                if center[0]<(cc[0]+cir[1]) and center[0]>(cc[0]-cir[1]) and center[1]<(cc[1]+cir[1]) and center[1]>(cc[1]-cir[1]):
                    if radius>cir[1]:
                        cv2.circle(img,center,radius,(0,255,0),2)
                    else:
                        return False
            cv2.circle(img,center,radius,(0,255,0),2)
            return True

        contours,thresh = get_contours(gray)
        c = 0
        c2 = 0
        circles = []
        for cnt in contours:
            M = cv2.moments(cnt)
     
            if M['m00'] != 0:
                # cx = int(M['m10']/M['m00'])
                # cy = int(M['m01']/M['m00'])
                # print M['m00'],cx,cy
                (x,y),radius = cv2.minEnclosingCircle(cnt)
                center = (int(x),int(y))
                radius = int(radius)
                if radius<60 and radius>20:
                    c+= 1
                    if check_circles(center,radius,circles,img):
                        c2+=1
                        circles.append([center,radius])
                # cv2.circle(img,(cx,cy),10,(0,0,255),3)
        print c, c2
        cv2.drawContours(gray, contours, -1, (0,255,0), 3)

        lower_blue = np.array([40, 0, 40])
        upper_blue = np.array([100, 35, 100])
        mask = cv2.inRange(img, lower_blue, upper_blue)
        contours2,thresh2 = get_contours(mask)

        colors = []
        for ct in contours2: 
            M = cv2.moments(ct)

            if M['m00']!= 0:
                (x,y),radius = cv2.minEnclosingCircle(ct)
                center = (int(x),int(y))
                radius = int(radius)
                # cv2.circle(img,center,radius,(255,0,0),2)
                if radius<40:
                    for circle in circles:
                        if x<(circle[0][0]+circle[1]) and x>(circle[0][0]-circle[1]) and y>(circle[0][1]-circle[1]) and y<(circle[0][1]+circle[1]):  
                            colors.append([center,radius+30,circle])
        
        checked = []
        for ob in colors:
            center = ob[0]
            radius = ob[1]
            if ob[2] in checked:
                pass
            else:
                checked.append(ob[2])
                cv2.circle(img,ob[2][0],ob[2][1]-10,(0,0,255),2)
        self.np_img = img
        cv2.imwrite('slide1.jpg',img)
        self.img2 = Image.open('slide1.jpg')
        # self.r_img = self.img2.resize((800, 600),Image.ANTIALIAS)
        w, h = self.root.winfo_screenwidth(), self.root.winfo_screenheight()
        self.img2 = self.img2.resize((w,h))
        self.photo_image = ImageTk.PhotoImage(self.img2)
        self.canvas.pack_forget()
        self.canvas = Canvas(self.root, width=self.img.size[0], height=self.img.size[1])
        self.canvas.create_image(10, 10, anchor=NW, image=self.photo_image)
        self.canvas.pack(side=LEFT, fill=BOTH)
        self.canvas.config(yscrollcommand=self.scrollbar_vert.set)
        self.canvas.config(xscrollcommand=self.scrollbar_hor.set)
        self.canvas.config(scrollregion=self.canvas.bbox(ALL))
        self.scrollbar_vert.config(command=self.canvas.yview)
        self.scrollbar_hor.config(command=self.canvas.xview)
        self.circles = circles
        self.colors = colors
        self.checked = checked
        print "DONE"


    def edit_cells(self):
        self.canvas.bind("<Button-1>",self.add)
        self.canvas.bind("<Button-3>",self.remove)

    def edit_parasites(self):
        self.canvas.bind("<Button-1>",self.add_p)
        self.canvas.bind("<Button-3>",self.remove_p)

    def add(self,event):
        x = event.x
        y = event.y
        print x,y
        for cir in self.circles:
            center = cir[0]
            rad = cir[1]
            d = math.sqrt(math.pow(x-center[0],2)+math.pow(y-center[1],2))
            if rad>d:
                return
        self.circles.append([(x,y),30])
        buff = cv2.imread('slide1.jpg')
        cv2.circle(buff,(x,y),30,(0,255,0),2)
        cv2.imwrite('slide1.jpg',buff)
        self.canvas.create_oval(x-30,y-30,x+30,y+30,outline="green")

    def remove(self,event):
        x = event.x
        y = event.y
        print x,y
        print self.filename
        buff = cv2.imread(self.filename)
        w, h = self.root.winfo_screenwidth(), self.root.winfo_screenheight()
        buff2 = cv2.resize(buff, (w,h), interpolation=cv2.INTER_AREA)
        for i,cir in enumerate(self.circles):
            center = cir[0]
            rad = cir[1]
            d = math.sqrt(math.pow(x-center[0],2)+math.pow(y-center[1],2))
            if rad>d:
                print "removed"
                print cir
                # self.circles.remove(cir)
                del self.circles[i]

            else:
                cv2.circle(buff2,center,rad,(0,255,0),2)
        for cir in self.checked:
            center = cir[0]
            rad = cir[1]
            cv2.circle(buff2,center,rad,(255,0,0),2)

        cv2.imwrite('slide1.jpg',buff2)
        self.img2 = Image.open('slide1.jpg')
        w, h = self.root.winfo_screenwidth(), self.root.winfo_screenheight()
        self.img2 = self.img2.resize((w,h))
        self.photo_image = ImageTk.PhotoImage(self.img2)
        self.canvas.pack_forget()
        self.canvas = Canvas(self.root, width=self.img.size[0], height=self.img.size[1])
        self.canvas.create_image(10, 10, anchor=NW, image=self.photo_image)
        self.canvas.pack(side=LEFT, fill=BOTH)
        self.canvas.config(yscrollcommand=self.scrollbar_vert.set)
        self.canvas.config(xscrollcommand=self.scrollbar_hor.set)
        self.canvas.config(scrollregion=self.canvas.bbox(ALL))
        self.scrollbar_vert.config(command=self.canvas.yview)
        self.scrollbar_hor.config(command=self.canvas.xview)
        self.canvas.bind("<Button-1>",self.add)
        self.canvas.bind("<Button-3>",self.remove)
            

    def add_p(self,event):
        x = event.x
        y = event.y
        print x,y
        for cir in self.checked:
            center = cir[0]
            rad = cir[1]
            if x>(center[0]-(rad+5)) and x<(center[0]+(rad+5)) and y>(center[1]-(rad+5)) and y<(center[1]+(rad+5)):
                return
        self.checked.append([(x,y),20])
        buff = cv2.imread('slide1.jpg')
        cv2.circle(buff,(x,y),20,(255,0,0),2)
        cv2.imwrite('slide1.jpg',buff)
        self.canvas.create_oval(x-20,y-20,x+20,y+20,outline="red")

    def remove_p(self,event):
        x = event.x
        y = event.y
        print x,y
        buff = cv2.imread(self.filename)
        w, h = self.root.winfo_screenwidth(), self.root.winfo_screenheight()
        buff2 = cv2.resize(buff, (w,h), interpolation=cv2.INTER_AREA)
        for cir in self.circles:
            center = cir[0]
            rad = cir[1]
            cv2.circle(buff2,center,rad,(0,255,0),2)
        for cir in self.checked:
            center = cir[0]
            rad = cir[1]
            if x>(center[0]-(rad+5)) and x<(center[0]+(rad+5)) and y>(center[1]-(rad+5)) and y<(center[1]+(rad+5)):
                self.checked.remove(cir)
            else:
                cv2.circle(buff2,center,rad,(255,0,0),2)
        cv2.imwrite('slide1.jpg',buff2)
        self.img2 = Image.open('slide1.jpg')
        self.photo_image = ImageTk.PhotoImage(self.img2)
        self.canvas.pack_forget()
        self.canvas = Canvas(self.root, width=self.img.size[0], height=self.img.size[1])
        self.canvas.create_image(10, 10, anchor=NW, image=self.photo_image)
        self.canvas.pack(side=LEFT, fill=BOTH)
        self.canvas.config(yscrollcommand=self.scrollbar_vert.set)
        self.canvas.config(xscrollcommand=self.scrollbar_hor.set)
        self.canvas.config(scrollregion=self.canvas.bbox(ALL))
        self.scrollbar_vert.config(command=self.canvas.yview)
        self.scrollbar_hor.config(command=self.canvas.xview)
        self.canvas.bind("<Button-1>",self.add_p)
        self.canvas.bind("<Button-3>",self.remove_p)

    # def export(self):
    #     scope = ['https://spreadsheets.google.com/feeds']
    #     credentials = SignedJwtAssertionCredentials('190922689116-38i0f8bhegkdivggve8qivk12gkbdm6v.apps.googleusercontent.com', 'g3_HZuRqhAKCTK86a5qpcw5P', scope)
    #     gc = gspread.authorize(credentials)
    #     wks = gc.open("parasite_data").sheet1
    #     i = 1
    #     col_list = wks.col_values(1)
    #     for value in col_list:
    #         if value == None:
    #             break
    #         i+=1
    #     wks.update_acell('A%s'%(i),len(self.circles))
    #     wks.update_acell('B%s'%(i),len(self.checked))
    #     return
    def export(self):
        i = 0
        with open('results.csv') as cfile:
            reader = csv.DictReader(cfile)
            for row in reader:
                i+=1
        with open('results.csv', 'a') as cfile: 
            fields = ['Cells','Parasites']
            writer = csv.DictWriter(cfile, fieldnames = fields)
            if i>= 1:
                writer.writerow({'Cells': str(len(self.circles)), 'Parasites': str(len(self.checked))})
            else:
                writer.writeheader()
                writer.writerow({'Cells': str(len(self.circles)), 'Parasites': str(len(self.checked))})
        print "DONE"
        

def main():
    root = Tk()
    w, h = root.winfo_screenwidth(), root.winfo_screenheight()
    root.geometry("%dx%d+0+0" % (w, h))
    app = App(root)
    app.run()

if __name__ == '__main__':
    main()