//PIN VARIABLES - CHANGE THIS
int red_light_pin= 9;
int green_light_pin = 10;
int blue_light_pin = 11;

void setup() {
  Serial.begin(9600);
  pinMode(red_light_pin, OUTPUT);
  pinMode(green_light_pin, OUTPUT);
  pinMode(blue_light_pin, OUTPUT);
}

void loop() {
  if(Serial.available()>0){   //Reads serial input from node.js server
    String receivedData = Serial.readString();  
    int dataLength = receivedData.length()+1;
    char charArray[dataLength];
    receivedData.toCharArray(charArray, dataLength);

    char *strings[7];
    char *ptr = NULL;
    byte index = 0;
    ptr = strtok(charArray, ",");
    while (ptr != NULL)
    {
      strings[index] = ptr;
      index++;
      ptr = strtok(NULL, ",");
    }
    int r1 = atoi(strings[0]);
    int g1 = atoi(strings[1]);
    int b1 = atoi(strings[2]);
    if(String(strings[3])=="gr"){
      int r2 = atoi(strings[4]);
      int g2 = atoi(strings[5]);
      int b2 = atoi(strings[6]);

      int rc = r1;
      int gc = g1;
      int bc = b1;

      bool rclimb = true;
      bool gclimb = true;
      bool bclimb = true;

      while (Serial.available()==0){
         delay(25);
         
         if(rc==r1){rclimb=true;}else if(rc==r2){rclimb=false;}
         if(gc==g1){gclimb=true;}else if(gc==g2){gclimb=false;}
         if(bc==b1){bclimb=true;}else if(bc==b2){bclimb=false;}

         if (r1!=r2){
           if(rclimb==true){rc++;}else{rc--;}
         }
         if (g1!=g2){
           if(gclimb==true){gc++;}else{gc--;}
         }
         if (b1!=b2){
           if(bclimb==true){bc++;}else{bc--;}
         }
         analogWrite(red_light_pin, rc);
         analogWrite(green_light_pin, gc);
         analogWrite(blue_light_pin, bc);
         Serial.write(strings[3]);
      }
    }else{
      analogWrite(red_light_pin, r1);
      analogWrite(green_light_pin, g1);
      analogWrite(blue_light_pin, b1);
      
      Serial.println(r1);
    Serial.println(g1);
    Serial.println(b1);
    }
  }
}
