https://noizeramp.com/2016/10/19/ffmpeg-fade-in-out-expressions/
https://dev.to/dak425/add-fade-in-and-fade-out-effects-with-ffmpeg-2bj7

Title
if(lt(t, 1),0,if(lt(t,2),    (t- 1)/1 ,if(lt(t,8),       1,if(lt(t,9),          (1-(t-8))/1,0))))
if(lt(t,t1),0,if(lt(t,t1+t2),(t-t1)/t2,if(lt(t,t1+t2+t3),1,if(lt(t,t1+t2+t3+t4),(t4-(t-t1-t2-t3))/t4,0))))

t1 (1) - fade in start time (in seconds),
t2 (1) - fade in length (in seconds),
t3 (2+4) - time to keep fully opaque (in seconds),
t4 (1) - fade out length (in seconds).

Current/Investment Values
if(lt(t, 1),0,if(lt(t,2),    (t- 1)/1 ,if(lt(t,4),       1,if(lt(t,5),          (1-(t-4))/1,0))))
if(lt(t,t1),0,if(lt(t,t1+t2),(t-t1)/t2,if(lt(t,t1+t2+t3),1,if(lt(t,t1+t2+t3+t4),(t4-(t-t1-t2-t3))/t4,0))))

t1 (1) - fade in start time (in seconds),
t2 (1) - fade in length (in seconds),
t3 (2) - time to keep fully opaque (in seconds),
t4 (1) - fade out length (in seconds).

Thank You Note
if(lt(t, 11),0,if(lt(t,12),    (t- 1)/1 ,if(lt(t,24),       1,if(lt(t,25),          (1-(t-24))/1,0))))
if(lt(t,t1),0,if(lt(t,t1+t2),(t-t1)/t2,if(lt(t,t1+t2+t3),1,if(lt(t,t1+t2+t3+t4),(t4-(t-t1-t2-t3))/t4,0))))

t1 (1+10) - fade in start time (in seconds),
t2 (1) - fade in length (in seconds),
t3 (2+4+6) - time to keep fully opaque (in seconds),
t4 (1) - fade out length (in seconds).