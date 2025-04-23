import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';

class BasicAudioPlayer extends StatefulWidget {
  @override
  _BasicAudioPlayerState createState() => _BasicAudioPlayerState();
}

class _BasicAudioPlayerState extends State<BasicAudioPlayer> {
  final AudioPlayer _audioPlayer = AudioPlayer();
  bool isPlaying = false;
  int currentIndex = 0;
  bool isLooping = false;

  final List<Map<String, String>> songs = [
    {
      "title": "Kaisa Mai",
      "path": "audio/KaisaMai.mp3",
      "image": "assets/images/avg.jpg",
      "artist": "Arpit Bala"
    },
    {
      "title": "Nindiya ke Par",
      "path": "audio/Nindiya.mp3",
      "image": "assets/images/uzair.jpg",
      "artist": "Uzair Jaswal"
    },
    {
      "title": "Zimmedar",
      "path": "audio/Zimmedaar.mp3",
      "image": "assets/images/zim.jpg",
      "artist": "Arpit Bala"
    },
    {
      "title": "Gulabo",
      "path": "audio/GULABO.mp3",
      "image": "assets/images/gul.jfif",
      "artist": "Arpit Bala"
    },
    {
      "title": "F U N K A",
      "path": "audio/funka.mp3",
      "image": "assets/images/funk.png",
      "artist": "Arpit Bala"
    },
    {
      "title": "Tum Hy Ho",
      "path": "audio/tumhiho.mp3",
      "image": "assets/images/sha.jpg",
      "artist": "Arijit Singh"
    },
    {
      "title": "Last Friday Night",
      "path": "audio/Katy.mp3",
      "image": "assets/images/kate.png",
      "artist": "Katy Perry"
    },
    {
      "title": "Boy with Luv",
      "path": "audio/bts.mp3",
      "image": "assets/images/v.jpg",
      "artist": "BTS"
    },
    {
      "title": "Dandelions",
      "path": "audio/dandelions.mp3",
      "image": "assets/images/dan.jpg",
      "artist": "BTS"
    },
    {
      "title": "Love & Honour",
      "path": "audio/itachi.mp3",
      "image": "assets/images/it.jpg",
      "artist": "Naruto"
    },
    {
      "title": "You're My Escape",
      "path": "audio/escape.mp3",
      "image": "assets/images/na.png",
      "artist": "Naruto"
    },
    {
      "title": "Without You",
      "path": "audio/kakashi.mp3",
      "image": "assets/images/ka.jpeg",
      "artist": "Naruto"
    },
    {
      "title": "Love & Angel",
      "path": "audio/tra.mp3",
      "image": "assets/images/tra.jpg",
      "artist": "Trafalgar"
    },
    {
      "title": "End of Me",
      "path": "audio/endofme.mp3",
      "image": "assets/images/016.jpg",
      "artist": "Shamrocks"
    },
    {
      "title": "Its Not Over",
      "path": "audio/itsover.mp3",
      "image": "assets/images/shan.jpg",
      "artist": "Shanks"
    },
    {
      "title": "Kabir Singh",
      "path": "audio/kitna.mp3",
      "image": "assets/images/sha.jpg",
      "artist": "Arijit Singh"
    },
    {
      "title": "Lucid Dreams",
      "path": "audio/Lucid.mp3",
      "image": "assets/images/de.jpeg",
      "artist": "Juice"
    },
    {
      "title": "Maya Bee",
      "path": "audio/maya.mp3",
      "image": "assets/images/maya.jpg",
      "artist": "Maya"
    },
    {
      "title": "Espresso",
      "path": "audio/sabrina.mp3",
      "image": "assets/images/sab.jpg",
      "artist": "Sabrina Carpenter"
    },
    {
      "title": "Timmy Turner",
      "path": "audio/tim.mp3",
      "image": "assets/images/de.jpeg",
      "artist": "Desiigner"
    },
  ];

  @override
  void initState() {
    super.initState();

    _audioPlayer.onPlayerComplete.listen((event) {
      if (isLooping) {
        _playSong(currentIndex);
      } else {
        _nextSong();
      }
    });
  }

  Future<void> _playSong(int index) async {
    try {
      await _audioPlayer.stop();
      await _audioPlayer.setSource(AssetSource(songs[index]["path"]!));
      await _audioPlayer.resume();
      setState(() {
        isPlaying = true;
        currentIndex = index;
      });

      // Debugging print
      print("🎵 Playing song: ${songs[currentIndex]}");
      print("🎤 Artist: ${songs[currentIndex]["artist"]}");
    } catch (e) {
      print("❌ Error playing audio: $e");
    }
  }

  Future<void> _pauseAudio() async {
    await _audioPlayer.pause();
    setState(() => isPlaying = false);
  }

  Future<void> _nextSong() async {
    int nextIndex = (currentIndex + 1) % songs.length;
    _playSong(nextIndex);
  }

  Future<void> _previousSong() async {
    int prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    _playSong(prevIndex);
  }

  void _toggleLoop() {
    setState(() {
      isLooping = !isLooping;
    });
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Container(
          decoration: BoxDecoration(
            color: Colors.black,
            // gradient: LinearGradient(
            //     begin: Alignment.topCenter,
            //     end: Alignment.bottomCenter,
            //     colors: <Color>[Colors.black, Colors.blue]),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CarouselSlider(
                items: songs.map((song) {
                  return ClipRRect(
                    borderRadius: BorderRadius.circular(15),
                    child: Image.asset(
                      song["image"]!,
                      width: 350,
                      height: 350,
                      fit: BoxFit.contain,
                    ),
                  );
                }).toList(),
                options: CarouselOptions(
                  height: 250,
                  enlargeCenterPage: true,
                  enableInfiniteScroll: true,
                  onPageChanged: (index, reason) {
                    setState(() {
                      currentIndex = index;
                    });
                    _playSong(index);
                  },
                ),
              ),
              const SizedBox(height: 20),
              Text(
                songs[currentIndex]["title"]!,
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              Text(
                songs[currentIndex]["artist"] ?? "Unknown Artist",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 80),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    icon: Icon(Icons.skip_previous_rounded, size: 50),
                    onPressed: _previousSong,
                  ),
                  IconButton(
                    icon: Icon(
                      isPlaying
                          ? Icons.pause_rounded
                          : Icons.play_arrow_rounded,
                      size: 50,
                    ),
                    onPressed:
                        isPlaying ? _pauseAudio : () => _playSong(currentIndex),
                  ),
                  IconButton(
                    icon: Icon(Icons.skip_next_rounded, size: 50),
                    onPressed: _nextSong,
                  ),
                ],
              ),
              const SizedBox(height: 20),
              IconButton(
                icon: Icon(
                  isLooping ? Icons.loop : Icons.repeat_one_rounded,
                  color: isLooping ? Colors.green : Colors.black,
                  size: 30,
                ),
                onPressed: _toggleLoop,
              ),
              Text(isLooping ? "Looping ON" : "Looping OFF"),
            ],
          ),
        ),
      ),
    );
  }
}
