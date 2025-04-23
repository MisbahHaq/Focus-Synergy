import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:google_fonts/google_fonts.dart';

class SongListPage extends StatefulWidget {
  @override
  _SongListPageState createState() => _SongListPageState();
}

class _SongListPageState extends State<SongListPage> {
  final AudioPlayer _audioPlayer = AudioPlayer();
  bool isPlaying = false;
  bool isLooping = false;
  int currentIndex = -1;

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
      body: Container(
        decoration: BoxDecoration(
            // image: DecorationImage(
            //   image: AssetImage("assets/images/g.jpg"),
            //   fit: BoxFit.cover,
            // ),
            color: Colors.black),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 35),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 50),
                child: Text(
                  "What do you want\n to hear",
                  style: GoogleFonts.poppins(
                      fontSize: 45,
                      fontWeight: FontWeight.w700,
                      color: Colors.white),
                ),
              ),
              if (isPlaying && currentIndex != -1)
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(15),
                  ),
                  padding: EdgeInsets.all(5),
                  child: Row(
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
                        onPressed: isPlaying
                            ? _pauseAudio
                            : () => _playSong(currentIndex),
                      ),
                      IconButton(
                        icon: Icon(Icons.skip_next_rounded, size: 50),
                        onPressed: _nextSong,
                      ),
                    ],
                  ),
                ),
              Expanded(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: songs.length,
                  itemBuilder: (context, index) {
                    final song = songs[index];
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundImage: AssetImage(song['image']!),
                      ),
                      title: Text(
                        song['title']!,
                        style: TextStyle(color: Colors.white),
                      ),
                      subtitle: Text(
                        song['artist']!,
                        style: TextStyle(color: Colors.white),
                      ),
                      onTap: () {
                        _playSong(index);
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => AudioPlayerPage(
                                song: song,
                                audioPlayer: _audioPlayer,
                                isPlaying: isPlaying),
                          ),
                        ).then((_) {
                          setState(() {});
                        });
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class AudioPlayerPage extends StatefulWidget {
  final Map<String, String> song;
  final AudioPlayer audioPlayer;
  final bool isPlaying;

  AudioPlayerPage(
      {required this.song, required this.audioPlayer, required this.isPlaying});

  @override
  _AudioPlayerPageState createState() => _AudioPlayerPageState();
}

class _AudioPlayerPageState extends State<AudioPlayerPage> {
  bool isPlaying = false;
  bool isLooping = false;

  @override
  void initState() {
    super.initState();

    this.isPlaying = widget.isPlaying;

    widget.audioPlayer.onPlayerComplete.listen((event) {
      if (isLooping) {
        _playSong();
      }
    });

    _playSong();
  }

  Future<void> _playSong() async {
    try {
      await widget.audioPlayer.stop();
      await widget.audioPlayer.setSource(AssetSource(widget.song['path']!));
      await widget.audioPlayer.resume();
      setState(() {
        isPlaying = true;
      });
    } catch (e) {
      print("❌ Error playing audio: $e");
    }
  }

  Future<void> _pauseAudio() async {
    await widget.audioPlayer.pause();
    setState(() => isPlaying = false);
  }

  void _toggleLoop() {
    setState(() {
      isLooping = !isLooping;
    });
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        centerTitle: true,
        title: Text(widget.song['title']!),
      ),
      body: Center(
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: <Color>[Colors.black, Colors.blue]),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset(
                widget.song['image']!,
                width: 200,
                height: 200,
                fit: BoxFit.contain,
              ),
              const SizedBox(height: 20),
              Text(
                widget.song['title']!,
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              Text(
                widget.song['artist']!,
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white),
              ),
              const SizedBox(height: 80),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    icon: Icon(Icons.skip_previous_rounded, size: 50),
                    onPressed: () {},
                  ),
                  IconButton(
                    icon: Icon(
                      isPlaying
                          ? Icons.pause_rounded
                          : Icons.play_arrow_rounded,
                      size: 50,
                    ),
                    onPressed: isPlaying ? _pauseAudio : _playSong,
                  ),
                  IconButton(
                    icon: Icon(Icons.skip_next_rounded, size: 50),
                    onPressed: () {},
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
