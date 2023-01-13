//PIN VARIABLES - CHANGE THIS
int red_light_pin = 9;
int green_light_pin = 10;
int blue_light_pin = 11;


//OTHER VARIABLES - DO NOT TOUCH
const byte numChars = 32;
char receivedChars[numChars];

boolean newData = false;

int r1;
int g1;
int b1;
int grad;
int r2;
int g2;
int b2;
int rc;
int gc;
int bc;

bool rclimb;
bool gclimb;
bool bclimb;

//Setup
void setup() {
  Serial.begin(9600);
  pinMode(red_light_pin, OUTPUT);
  pinMode(green_light_pin, OUTPUT);
  pinMode(blue_light_pin, OUTPUT);
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  static boolean recvInProgress = false;
  static byte ndx = 0;
  char *strings[8];
  char *ptr;
  char startMarker = '<';
  char endMarker = '>';
  char rcc;
  //Serial reading
  while (Serial.available() > 0 && newData == false) {
    rcc = Serial.read();

    if (recvInProgress == true) {
      if (rcc != endMarker) {
        receivedChars[ndx] = rcc;
        ndx++;
        if (ndx >= numChars) {
          ndx = numChars - 1;
        }
      }
      else {
        receivedChars[ndx] = '\0';
        recvInProgress = false;
        ndx = 0;
        newData = true;
      }
    }

    else if (rcc == startMarker) {
      recvInProgress = true;
    }
  }
  //String parsing
  if (newData == true) {
    //digitalWrite(LED_BUILTIN, HIGH);
    byte index = 0;
    ptr = strtok(receivedChars, ",");
    while (ptr != '\0')
    {
      strings[index] = ptr;
      index++;
      ptr = strtok('\0', ",");
    }

    r1 = atoi(strings[0]);
    g1 = atoi(strings[1]);
    b1 = atoi(strings[2]);
    grad = atoi(strings[3]);
    r2 = atoi(strings[4]);
    g2 = atoi(strings[5]);
    b2 = atoi(strings[6]);

    if (grad == 1) {
      rc = r1;
      gc = g1;
      bc = b1;

      rclimb = true;
      gclimb = true;
      bclimb = true;
    } else {
      
      analogWrite(red_light_pin, r1);
      analogWrite(green_light_pin, g1);
      analogWrite(blue_light_pin, b1); 
    }
    newData = false;
  }
  //Gradient
  if (grad == 1) {
    delay(25);

    if (rc == min(r1,r2)) {
      rclimb = true;
    } else if (rc == max(r1,r2)) {
      rclimb = false;
    }
    if (gc == min(g1,g2)) {
      gclimb = true;
    } else if (gc == max(g1,g2)) {
      gclimb = false;
    }
    if (bc == min(b1,b2)) {
      bclimb = true;
    } else if (bc == max(b1,b2)) {
      bclimb = false;
    }

    if (r1 != r2) {
      if (rclimb == true) {
        rc++;
      } else {
        rc--;
      }
    }
    if (g1 != g2) {
      if (gclimb == true) {
        gc++;
      } else {
        gc--;
      }
    }
    if (b1 != b2) {
      if (bclimb == true) {
        bc++;
      } else {
        bc--;
      }
    }
    analogWrite(red_light_pin, rc);
    analogWrite(green_light_pin, gc);
    analogWrite(blue_light_pin, bc); 
  }
}
