# from cv2.cv import *
import cv2
import numpy as np
import sys
from matplotlib import pyplot as plt

#TO DO: find all of the cells in a square region. 
#FInd cells with purple stuff in them. 
def load_img():
    filename = sys.argv[1]
    img = cv2.imread(filename)
    cv2.imwrite('slide_1.jpg',img)
    gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
    return img,gray

def get_contours(gray):
    ret,thresh = cv2.threshold(gray,127,255,cv2.THRESH_BINARY | cv2.THRESH_OTSU)
    contours, hierarchy = cv2.findContours(thresh,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)
    return contours,thresh

def check_circles(center,radius,circles,img):
    print "CHECK"
    for cir in circles:
        if circles == []:
            break
        cc = cir[0]
        if center[0]<(cc[0]+cir[1]) and center[0]>(cc[0]-cir[1]) and center[1]<(cc[1]+cir[1]) and center[1]>(cc[1]-cir[1]):
            if radius>cir[1]:
                cv2.circle(img,center,radius,(0,255,0),2)
            else:
                return False
    print "DRAW"
    cv2.circle(img,center,radius,(0,255,0),2)
    return True

def main():
    img,gray = load_img()

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
            cv2.circle(img,center,radius,(255,0,0),2)
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
    self.checked = checked
    self.circles = circles

    plt.subplot(121),plt.imshow(img)
    plt.title('Original Image'), plt.xticks([]), plt.yticks([])
    plt.subplot(122),plt.imshow(mask,cmap = 'gray')
    plt.title('Mask Image'), plt.xticks([]), plt.yticks([])
    cv2.imwrite('slide1.jpg',img)
    # plt.show()
    # NamedWindow("opencv")
    # print np.amax(gray)
    # print np.amin(gray)
    # plt.imshow(thresh,cmap = 'gray')
    # # print gray
    plt.show()

if __name__ == '__main__':
    main()