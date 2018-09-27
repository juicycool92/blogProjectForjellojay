#include<iostream>
#include<string>
#include<cstring>
using namespace std;
class Mystring {
    //문자열을 방르일 곳 필요
private:
    char *str;
    int len;
public:


    Mystring(char *start, char *end) {//6번
        len = (int)end - (int)start;
        str = new char[len + 1];
        for (int i = 0; i < len; i++)
            str[i] = *(start + i);
        str[len] = NULL;
    }//6번
    Mystring(char *s, int num) {//5번!
        str = new char[num + 1];
        for (int i = 0; i < num; i++)
            str[i] = s[i];
        str[num] = '\0';
    }//5번

    Mystring(const Mystring &s)
    {
        len = s.len;
        str = new char[s.len];
        //*str = { NULL, };
        strcpy(str, s.str);
        
    }




    Mystring(int a, char s) { // 2번
        str = new char[a + 1];
        for (int i = 0; i<a; i++)
            str[i] = s;
        str[a] = '\0';
    }//2번

    Mystring(char *s) {//constructure
        len = strlen(s)+1;//문자열갯수 확인, null값 포함
        str = new char[len];//문자열갯수만큼 배열 생성
        strcpy(str, s);//문자열 str에다가 삽입
    }
    Mystring():len(100) {//생성자 default
        str = new char[len];
    }
    ~Mystring() { //소멸자
        delete str;
    }
    Mystring &operator+(const Mystring &my)
    {
        char *a = new char[my.len];                     // 길이만큼 생성
        strcpy(a, str);                              // 문자열 복사
        delete[]str;                              // 소멸자

        len += strlen(my.str);                        // 문자열의 길이를 늘려줌
        str = new char[len];                        // 길이만큼 생성
        strcpy(str, a);                              // 문자열 복사
        strcat(str, my.str);                        // 문자열을 뒤에 덧붙여줌

        return *this;
    }

    char& operator+=(const char *s)//문자열 결합
    {
        len += strlen(s);
        char *temp = new char[len];
        strcpy(temp, str);
        strcat(temp, s);
        delete str;
        str = temp;
        return *str;
    }
    char& operator[](int num) {
        return str[num];
    }

    Mystring &operator=(const Mystring &my)
    {
        delete[]str;                           // 소멸자 (메모리확보)
        len = my.len;                           // 문자열 길이만큼
        str = new char[len];                     // 문자열 생성
        strcpy(str, my.str);                     // 복사

        return *this;
    }


    friend ostream& operator<<(ostream &out, const Mystring &my);
    friend istream& operator >> (istream &in, const Mystring &mystr);
    //friend istream& operator >> (istream &in, Mystring &mystr);

};
ostream& operator<<(ostream &out, const Mystring &my) {
    out << my.str;
    return out;
}

istream& operator >> (istream &in, const Mystring &mystr) {
    in >> mystr.str;

    return in;
}

int main() {
   
    Mystring one("lottery winner"); 
    cout << one << endl;
   
   
   
    Mystring two(20, '$'); cout << two << endl;
    Mystring three(one); cout << three << endl;


    cout << "[[[okay]]]" << endl;

    one += "oops";
    cout << one << endl;//문자열결합
                       
    two = "sorry that was"; // 대입연산자 함수 호출
    cout << two << endl;
    cout << "[[[okay2]]]" << endl;


    three[0] = 'p';//첨자연산자함수 호출
    cout << three << endl;
    cout << "[[[okay3]]]" << endl;
   
    Mystring four;
    four = two + three;
    cout << four << endl;
   
    char alis[] = "all's well that ends well";
    Mystring five(alis, 20);
    cout << five << "!\n";
   
    Mystring six(alis + 6, alis + 10);//주솟값+6 이니깐...
    cout << six << ",";

    Mystring seven(&five[6], &five[10]);
    cout << seven << "...\n";

    Mystring eight;//str = new char[100]
    cout << "문자열 입력하세여 : ";
    cin >> eight;
    cout << "입력한 문자열은 \"" << eight << "\"입니다" << endl;
    return -12511;
}