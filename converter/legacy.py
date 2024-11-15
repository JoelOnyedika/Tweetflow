from moviepy.editor import *
from moviepy.video.tools.segmenting import findObjects
import numpy as np

class Animate:
    def __init__(self):
        self.screensize = (720, 460)
        self.txtClip = TextClip(
            txt="Hello World", 
            fontsize=70, 
            color='white',
            font="Amiri-Bold",
        )
        self.cvc = CompositeVideoClip([self.txtClip.set_pos('center')], size=self.screensize)
        self.rotMatrix = lambda a: np.array([[np.cos(a), np.sin(a)], [-np.sin(a), np.cos(a)]])
        self.letters = findObjects(self.cvc)

    def moveLetters(self, letters: any, funcpos: any):
        return [ letter.set_pos(funcpos(letter.screenpos, i, len(letters))) for i, letter in enumerate(self.letters) ]

    def vortex(self, screenpos: tuple, i: int, nletters: int):
        damping = lambda time: 1.0/(.3+time**8)
        angle = i*np.pi*nletters
        v = self.rotMatrix(angle).dot([-1, 0])
        if i%2: v[1] = -v[1]
        return lambda time: screenpos + 400*damping(time) * self.rotMatrix(.5*damping(time)*angle).dot(v)

    def arrive(self, screenpos,i,nletters):
        v = np.array([-1,0])
        d = lambda t : max(0, 3-3*t)
        return lambda t: screenpos-400*v*d(t-0.2*i)

    def werid(self, screenpos, i, nletters):
        v = np.array([-1, 0]) # this is like a 2d grid v[0] is like left-right v[1] is top-bottom
        d = lambda t: min(0, 3*t) # min will make the shit go up and max make it fall down and its the speed/frequency
        return lambda t: screenpos+400*v*d(t-0.2*i)

    def drop_in(self, screenpos, i, nletters):
        vector = np.array([0, 1]) # Direction vector, up or down
        damping = lambda time: 1 / (1 + time**2) # speed decreases overtime creating an effect
        return lambda time: screenpos + 200 * damping(time) * vector # Movement function

    def bouncy(self, screenpos, i, nletters):
        direction = np.array([0, -1])
        bounce_height = lambda time: 2 * np.sin(np.pi * time) # This creates an updown effect
        return lambda time: screenpos + 100 * bounce_height(time) * direction

    def left_to_right(self, screenpos, i, nletters):
        speed = 10
        return lambda time: screenpos + np.array([speed * time, 0])

    def typewriter(self, screenpos, i, nletters):
        delay = 0.4  # Time delay between each letter
        return lambda t: screenpos if t > i * delay else (-1000, -1000)

    def kill_me(self, screenpos, i, nletters):
        return lambda t: screenpos[0] + 5 * t, screenpos[1]



    def create_final_clip(self):
        clips = [ CompositeVideoClip(self.moveLetters(self.letters, funcpos), 
                    size=self.screensize).subclip(0, 5) 
                    for funcpos in [self.kill_me] ]
        final_clip = concatenate_videoclips(clips)
        final_clip.write_videofile(
            "hello_world.mp4",
            fps=24,
            codec='libx264',
            preset='medium'
        )

anim = Animate()
anim.create_final_clip()

"""
cos(angle) gives the x-coordinate, 
and sin(angle) gives the y-coordinate, 
for a point moving in a circular path.

Remember that vector == direction

Use sin and cos for oscillations or circular movement.
Use **** (power) for slowing things down over time.
Experiment with * or / to scale movement distances or speed.
"""